import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SafetyProfile, ProfileStatus, QRStatus } from '../types/database';

export interface DashboardKPIs {
  totalParticipants: number;
  pendingRequests: number;
  verifiedProfiles: number;
  rejectedProfiles: number;
  requestedQRs: number;
  generatedQRs: number;
  issuedQRs: number;
  activeQRs: number;
  recentScans: number;
  gpsScans: number;
}

export const safetyService = {
  /**
   * Fetch aggregate KPI metrics directly from Supabase tables
   */
  async getDashboardKPIs(): Promise<DashboardKPIs> {
    if (!isSupabaseConfigured) {
      return {
        totalParticipants: 0,
        pendingRequests: 0,
        verifiedProfiles: 0,
        rejectedProfiles: 0,
        requestedQRs: 0,
        generatedQRs: 0,
        issuedQRs: 0,
        activeQRs: 0,
        recentScans: 0,
        gpsScans: 0,
      };
    }

    try {
      // Execute parallel counts
      const [
        totalRes,
        pendingRes,
        verifiedRes,
        rejectedRes,
        requestedQrRes,
        generatedQrRes,
        issuedQrRes,
        activeQrRes,
        scansRes,
        gpsScansRes
      ] = await Promise.all([
        supabase.from('safety_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('safety_profiles').select('*', { count: 'exact', head: true }).eq('status', 'PENDING_REVIEW'),
        supabase.from('safety_profiles').select('*', { count: 'exact', head: true }).eq('status', 'VERIFIED'),
        supabase.from('safety_profiles').select('*', { count: 'exact', head: true }).eq('status', 'REJECTED'),
        supabase.from('safety_profiles').select('*', { count: 'exact', head: true }).eq('qr_status', 'REQUESTED'),
        supabase.from('safety_profiles').select('*', { count: 'exact', head: true }).eq('qr_status', 'GENERATED'),
        supabase.from('safety_profiles').select('*', { count: 'exact', head: true }).eq('qr_status', 'ISSUED'),
        supabase.from('safety_profiles').select('*', { count: 'exact', head: true }).eq('qr_status', 'ACTIVE'),
        supabase.from('qr_scan_events').select('*', { count: 'exact', head: true }),
        supabase.from('qr_scan_events').select('*', { count: 'exact', head: true }).not('latitude', 'is', null),
      ]);

      return {
        totalParticipants: totalRes.count || 0,
        pendingRequests: pendingRes.count || 0,
        verifiedProfiles: verifiedRes.count || 0,
        rejectedProfiles: rejectedRes.count || 0,
        requestedQRs: requestedQrRes.count || 0,
        generatedQRs: generatedQrRes.count || 0,
        issuedQRs: issuedQrRes.count || 0,
        activeQRs: activeQrRes.count || 0,
        recentScans: scansRes.count || 0,
        gpsScans: gpsScansRes.count || 0,
      };
    } catch (err) {
      console.error('Failed to load dashboard KPIs:', err);
      throw err;
    }
  },

  /**
   * Fetch profiles with optional status and search filtering
   */
  async getProfiles(options?: {
    status?: ProfileStatus;
    qrStatus?: QRStatus;
    searchQuery?: string;
    limit?: number;
  }): Promise<SafetyProfile[]> {
    if (!isSupabaseConfigured) {
      return [];
    }

    try {
      let query = supabase
        .from('safety_profiles')
        .select(`
          id,
          owner_user_id,
          safety_id,
          profile_type,
          name,
          photo_url,
          status,
          qr_status,
          last_scanned_at,
          last_scan_latitude,
          last_scan_longitude,
          last_scan_location,
          created_at,
          family_safety_profiles (*),
          safety_accessories (*),
          qr_codes (*)
        `)
        .order('created_at', { ascending: false });

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.qrStatus) {
        query = query.eq('qr_status', options.qrStatus);
      }

      if (options?.searchQuery && options.searchQuery.trim()) {
        const term = `%${options.searchQuery.trim()}%`;
        query = query.or(`safety_id.ilike.${term},name.ilike.${term}`);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching safety profiles:', error);
        throw error;
      }

      // Map joined single relations
      return (data || []).map((item: any) => ({
        ...item,
        family_profile: Array.isArray(item.family_safety_profiles)
          ? item.family_safety_profiles[0] || null
          : item.family_safety_profiles || null,
        accessory: Array.isArray(item.safety_accessories)
          ? item.safety_accessories[0] || null
          : item.safety_accessories || null,
        qr_code: Array.isArray(item.qr_codes)
          ? item.qr_codes[0] || null
          : item.qr_codes || null,
      }));
    } catch (err) {
      console.error('getProfiles error:', err);
      throw err;
    }
  },

  /**
   * Verify a pending safety profile
   */
  async verifyProfile(profileId: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const { error } = await supabase
      .from('safety_profiles')
      .update({
        status: 'VERIFIED'
      })
      .eq('id', profileId);

    if (error) {
      console.error('Failed to verify profile:', error);
      throw error;
    }

    return true;
  },

  /**
   * Reject a safety profile
   */
  async rejectProfile(profileId: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const { error } = await supabase
      .from('safety_profiles')
      .update({
        status: 'REJECTED'
      })
      .eq('id', profileId);

    if (error) {
      console.error('Failed to reject profile:', error);
      throw error;
    }

    return true;
  }
};
