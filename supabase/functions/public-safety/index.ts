// Supabase Edge Function: public-safety
// Resolves a Safety ID and returns strictly privacy-sanitized public data.
// NEVER exposes private medical dossier, addresses, phone numbers, or internal UUIDs.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    let safetyId = url.searchParams.get("safety_id");

    if (!safetyId && req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      safetyId = body.safety_id;
    }

    if (!safetyId || typeof safetyId !== "string" || safetyId.trim() === "") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid safety_id parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanSafetyId = safetyId.trim();

    // Initialize Supabase with service role key inside Edge Function
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch safety profile by safety_id
    const { data: profile, error: profileErr } = await supabase
      .from("safety_profiles")
      .select("id, safety_id, profile_type, name, photo_url, status, qr_status")
      .eq("safety_id", cleanSafetyId)
      .maybeSingle();

    if (profileErr) {
      console.error("Database query error:", profileErr);
      return new Response(
        JSON.stringify({ error: "Failed to query safety record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!profile) {
      return new Response(
        JSON.stringify({ error: "Safety ID not found", code: "NOT_FOUND" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check QR lifecycle states
    if (profile.qr_status === "SUSPENDED") {
      return new Response(
        JSON.stringify({
          safety_id: profile.safety_id,
          profile_type: profile.profile_type,
          qr_status: "SUSPENDED",
          status: profile.status,
          message: "This MargDarshak Safety QR is temporarily inactive.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (profile.qr_status === "REVOKED") {
      return new Response(
        JSON.stringify({
          safety_id: profile.safety_id,
          profile_type: profile.profile_type,
          qr_status: "REVOKED",
          status: profile.status,
          message: "This MargDarshak Safety QR has been revoked.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build sanitized public response
    if (profile.profile_type === "DEPENDENT") {
      const { data: family } = await supabase
        .from("family_safety_profiles")
        .select("full_name, age, relationship, blood_group, medical_conditions, allergies, special_needs, emergency_instructions")
        .eq("safety_profile_id", profile.id)
        .maybeSingle();

      const publicData = {
        safety_id: profile.safety_id,
        profile_type: "DEPENDENT",
        status: profile.status,
        qr_status: profile.qr_status,
        name: family?.full_name || profile.name,
        photo_url: profile.photo_url || null,
        age: family?.age || null,
        relationship: family?.relationship || null,
        blood_group: family?.blood_group || null,
        emergency_info: {
          critical_allergies: family?.allergies || null,
          medical_alert: family?.medical_conditions || null,
          special_assistance: family?.special_needs || null,
          emergency_instructions: family?.emergency_instructions || null,
        }
      };

      return new Response(
        JSON.stringify(publicData),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // ACCESSORY
      const { data: acc } = await supabase
        .from("safety_accessories")
        .select("accessory_name, accessory_type, brand, model, color, description, photo_url")
        .eq("safety_profile_id", profile.id)
        .maybeSingle();

      const publicData = {
        safety_id: profile.safety_id,
        profile_type: "ACCESSORY",
        status: profile.status,
        qr_status: profile.qr_status,
        name: acc?.accessory_name || profile.name,
        photo_url: acc?.photo_url || profile.photo_url || null,
        accessory: {
          item_name: acc?.accessory_name || profile.name,
          accessory_type: acc?.accessory_type || null,
          brand: acc?.brand || null,
          model: acc?.model || null,
          color: acc?.color || null,
          description: acc?.description || null,
        }
      };

      return new Response(
        JSON.stringify(publicData),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err: any) {
    console.error("Unhandled error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
