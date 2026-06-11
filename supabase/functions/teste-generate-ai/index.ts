import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const body = await req.json().catch(() => null);

  if (!body?.responseId) {
    return jsonResponse({ error: "responseId obrigatório" }, 400);
  }
  console.log("Chamando generate-ai com responseId:", body.responseId);

  const res = await fetch(`${supabaseUrl}/functions/v1/generate-ai`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({
      responseId: body.responseId,
      force: false,
    }),
  });

  const resultText = await res.text();

  let result;
  try {
    result = JSON.parse(resultText);
  } catch {
    result = { raw: resultText };
  }

  return jsonResponse({
    success: res.ok,
    status: res.status,
    result,
  });

  return jsonResponse({
    success: !error,
    data,
    errorMessage: error?.message,
    errorDetails: error,
  });
});
