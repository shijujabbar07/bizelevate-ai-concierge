import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Admin-only utility: triggers the n8n Reminder Scheduler on demand via its
// "Run Now (Manual)" webhook. Used by the dashboard Tools page for demos and
// catch-up runs between the twice-daily cron executions.
//
// The webhook URL stays server-side here so the path (which is the shared
// secret) never ships in the dashboard JS bundle. Override via the
// N8N_RUN_NOW_WEBHOOK_URL function secret if the path is ever rotated.
const N8N_RUN_NOW_WEBHOOK_URL =
  Deno.env.get("N8N_RUN_NOW_WEBHOOK_URL") ??
  "https://bizelevate1.app.n8n.cloud/webhook/run-reminder-scheduler-45f4f2cddc804e06062489e8d9028247";

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

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const token = authHeader.replace("Bearer ", "");

  const {
    data: { user },
    error: authError,
  } = await adminClient.auth.getUser(token);

  if (authError || !user) return json({ error: "Unauthorized" }, 401);

  const { data: callerProfile } = await adminClient
    .from("user_profiles")
    .select("is_admin")
    .eq("user_id", user.id)
    .single();

  if (!callerProfile?.is_admin) {
    return json({ error: "Forbidden: admin access required" }, 403);
  }

  // ── Trigger the n8n scheduler webhook ──────────────────────────────────────
  try {
    const res = await fetch(N8N_RUN_NOW_WEBHOOK_URL, { method: "POST" });
    if (!res.ok) {
      return json(
        { error: `n8n webhook returned ${res.status}` },
        502,
      );
    }
  } catch (e) {
    return json({ error: `Failed to reach n8n: ${(e as Error).message}` }, 502);
  }

  return json({ success: true, triggered_at: new Date().toISOString() });
});
