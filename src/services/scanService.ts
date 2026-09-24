import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { QRScanEvent } from '../types/database';

export const scanService = {
  /**
   * Fetch all scan events for Admin Scan History and Leaflet Map
   */
  async getScanEvents(limit: number = 100): Promise<QRScanEvent[]> {
    if (!isSupabaseConfigured) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('qr_scan_events')
        .select(`
          id,
          safety_profile_id,
          latitude,
          longitude,
          location_name,
          scanned_at,
          scanner_user_agent,
          scan_status,
          safety_profiles (
            name,
            safety_id,
            profile_type,
            photo_url
          )
        `)
        .order('scanned_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error querying scan events:', error);
        throw error;
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        safety_profile_id: row.safety_profile_id,
        safety_id: row.safety_profiles?.safety_id || null,
        latitude: row.latitude ? Number(row.latitude) : null,
        longitude: row.longitude ? Number(row.longitude) : null,
        location_name: row.location_name || null,
        scanned_at: row.scanned_at,
        scanner_user_agent: row.scanner_user_agent || null,
        status: row.scan_status || 'RECORDED',
        safety_profile: row.safety_profiles || null,
      }));
    } catch (err) {
      console.error('scanService.getScanEvents error:', err);
      throw err;
    }
  },

  /**
   * Record a real scan event triggered from public finder page.
   * Tries Edge Function first, then direct Supabase fallback.
   */
  async recordScanEvent(params: {
    safety_id: string;
    latitude: number | null;
    longitude: number | null;
    permission_granted: boolean;
  }): Promise<{ success: boolean; scanned_at: string }> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase configuration is missing. Cannot record scan event.');
    }

    const now = new Date().toISOString();
    const userAgent = navigator.userAgent || 'Web Scanner';

    // 1. Attempt invoking Supabase Edge Function 'record-qr-scan'
    try {
      const { data, error } = await supabase.functions.invoke('record-qr-scan', {
        body: {
          safety_id: params.safety_id,
          latitude: params.latitude,
          longitude: params.longitude,
          permission_granted: params.permission_granted,
          scanner_user_agent: userAgent,
        }
      });

      if (!error && data?.success) {
        return { success: true, scanned_at: data.scanned_at || now };
      }
    } catch (edgeErr) {
      console.warn('Edge function unavailable, using direct DB client fallback:', edgeErr);
    }

    // 2. Direct client fallback if Edge Function is not deployed yet
    // Find profile
    const { data: profile, error: profErr } = await supabase
      .from('safety_profiles')
      .select('id, safety_id')
      .eq('safety_id', params.safety_id.trim())
      .maybeSingle();

    if (profErr || !profile) {
      throw new Error('Safety profile not found.');
    }

    // Insert scan event
    const { error: insertErr } = await supabase
      .from('qr_scan_events')
      .insert({
        safety_profile_id: profile.id,
        latitude: params.latitude,
        longitude: params.longitude,
        location_name: null, // Never fake location name
        permission_granted: params.permission_granted,
        scanned_at: now,
        scanner_user_agent: userAgent,
        scan_status: 'RECORDED',
      });

    if (insertErr) {
      console.error('Direct scan event insert failed:', insertErr);
      throw insertErr;
    }

    // Update safety_profiles last scan fields (only if coordinates were provided)
    if (params.latitude !== null && params.longitude !== null) {
      await supabase
        .from('safety_profiles')
        .update({
          last_scanned_at: now,
          last_scan_latitude: params.latitude,
          last_scan_longitude: params.longitude,
          last_scan_location: null,
        })
        .eq('id', profile.id);
    }

    return { success: true, scanned_at: now };
  }
};
