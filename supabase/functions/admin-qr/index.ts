// Supabase Edge Function: admin-qr
// Privileged administrative handler for QR lifecycle mutations

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const { action, safety_id, status } = body;

    if (!safety_id) {
      return new Response(
        JSON.stringify({ error: "Missing safety_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "update-status") {
      const allowedStatuses = ["GENERATED", "ISSUED", "ACTIVE", "SUSPENDED", "REVOKED"];
      if (!allowedStatuses.includes(status)) {
        return new Response(
          JSON.stringify({ error: "Invalid status value" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update both safety_profiles and qr_codes
      await supabase
        .from("safety_profiles")
        .update({ qr_status: status })
        .eq("safety_id", safety_id);

      await supabase
        .from("qr_codes")
        .update({ 
          status, 
          ...(status === 'ISSUED' ? { issued_at: new Date().toISOString() } : {})
        })
        .eq("safety_id", safety_id);

      return new Response(
        JSON.stringify({ success: true, safety_id, new_status: status }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("admin-qr error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
