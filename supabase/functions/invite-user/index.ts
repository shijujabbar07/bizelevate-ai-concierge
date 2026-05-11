import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  // ── Authenticate caller ────────────────────────────────────────────────────
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Unauthorized" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  // Verify JWT using admin client — more reliable than rebuilding with anon key
  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const token = authHeader.replace("Bearer ", "");

  const {
    data: { user },
    error: authError,
  } = await adminClient.auth.getUser(token);

  if (authError || !user) return json({ error: "Unauthorized" }, 401);

  // Check admin status via RLS-aware query using caller's JWT
  const callerClient = createClient(supabaseUrl, serviceRoleKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: callerProfile } = await callerClient
    .from("user_profiles")
    .select("is_admin")
    .eq("user_id", user.id)
    .single();

  if (!callerProfile?.is_admin) {
    return json({ error: "Forbidden: admin access required" }, 403);
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let email: string, client_id: string;
  try {
    ({ email, client_id } = await req.json());
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (!email || !client_id) {
    return json({ error: "email and client_id are required" }, 400);
  }

  // ── Privileged operations via service role ─────────────────────────────────

  // Upsert pending invitation (reset accepted_at if re-inviting)
  const { error: upsertError } = await adminClient
    .from("pending_invitations")
    .upsert(
      {
        email,
        client_id,
        invited_by: user.id,
        invited_at: new Date().toISOString(),
        accepted_at: null,
      },
      { onConflict: "email,client_id" }
    );

  if (upsertError) {
    return json({ error: upsertError.message }, 500);
  }

  // Send Supabase invite email — creates auth user if needed and emails a sign-in link
  const { error: inviteError } =
    await adminClient.auth.admin.inviteUserByEmail(email);

  // "already registered" is fine — the invitation row is what matters
  if (inviteError && !inviteError.message.toLowerCase().includes("already")) {
    return json({ error: inviteError.message }, 500);
  }

  return json({ success: true });
});
