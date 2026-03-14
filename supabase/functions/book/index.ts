import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Public redirect endpoint — no JWT required (URL token is the security)
Deno.serve(async (req: Request) => {
  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Extract call log UUID from URL path: /book/{uuid}
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const callLogId = parts[parts.length - 1];

  if (!callLogId || callLogId.length < 10) {
    return new Response("Not found", { status: 404 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // Fetch call log to get client_id
  const { data: callLog, error: clErr } = await supabase
    .from("call_logs")
    .select("client_id")
    .eq("id", callLogId)
    .single();

  if (clErr || !callLog) {
    return new Response("Not found", { status: 404 });
  }

  // Fetch client booking_link
  const { data: client, error: cErr } = await supabase
    .from("clients")
    .select("booking_link")
    .eq("id", callLog.client_id)
    .single();

  if (cErr || !client?.booking_link) {
    return new Response("No booking link configured", { status: 404 });
  }

  // Record click — fire and forget, don't block the redirect
  supabase
    .from("call_logs")
    .update({ booking_link_clicked: true })
    .eq("id", callLogId)
    .then(() => {});

  return new Response(null, {
    status: 302,
    headers: { Location: client.booking_link },
  });
});
