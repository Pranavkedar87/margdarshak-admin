// Supabase Edge Function: record-qr-scan
// Records a real scanner GPS event and updates safety_profile last scan coordinates.
// Never fabricates fake coordinates or location names.

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
    const body = await req.json().catch(() => ({}));
    const { safety_id, latitude, longitude, scanner_user_agent } = body;

    if (!safety_id) {
      return new Response(
        JSON.stringify({ error: "Missing required field: safety_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Latitude and longitude must be real valid numbers
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return new Response(
        JSON.stringify({ error: "Valid latitude and longitude numbers are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Basic coordinate range validation
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return new Response(
        JSON.stringify({ error: "Coordinates out of geographic range" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find profile
    const { data: profile, error: profileErr } = await supabase
      .from("safety_profiles")
      .select("id, safety_id")
      .eq("safety_id", safety_id.trim())
      .maybeSingle();

    if (profileErr || !profile) {
      return new Response(
        JSON.stringify({ error: "Safety profile not found for scan event" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = new Date().toISOString();
    const userAgent = scanner_user_agent || req.headers.get("user-agent") || "Web Scanner";

    // 1. Insert into qr_scan_events
    const { error: insertErr } = await supabase
      .from("qr_scan_events")
      .insert({
        safety_profile_id: profile.id,
        latitude,
        longitude,
        location_name: null, // Never fake location names
        scanned_at: now,
        scanner_user_agent: userAgent,
        status: "RECORDED"
      });

    if (insertErr) {
      console.error("Failed to insert qr_scan_event:", insertErr);
      return new Response(
        JSON.stringify({ error: "Failed to store scan event" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Update safety_profiles last scan telemetry
    const { error: updateErr } = await supabase
      .from("safety_profiles")
      .update({
        last_scanned_at: now,
        last_scan_latitude: latitude,
        last_scan_longitude: longitude,
        last_scan_location: null,
      })
      .eq("id", profile.id);

    if (updateErr) {
      console.warn("Failed to update profile telemetry:", updateErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        scanned_at: now,
        latitude,
        longitude,
        message: "Scan event successfully recorded"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Error in record-qr-scan:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
