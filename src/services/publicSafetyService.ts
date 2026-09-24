import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { PublicSafetyResponse } from '../types/database';

export const publicSafetyService = {
  /**
   * Fetches strictly sanitized public safety data for a given Safety ID.
   * Prioritizes Supabase Edge Function 'public-safety', falls back to safe RPC or safe select.
   */
  async getPublicProfile(safetyId: string): Promise<PublicSafetyResponse> {
    if (!safetyId || !safetyId.trim()) {
      throw new Error('Safety ID is required.');
    }

    const cleanSafetyId = safetyId.trim();

    if (!isSupabaseConfigured) {
      throw new Error('Supabase client is not configured.');
    }

    // 1. First attempt: Call Supabase Edge Function 'public-safety'
    try {
      const { data, error } = await supabase.functions.invoke('public-safety', {
        body: { safety_id: cleanSafetyId },
      });

      if (!error && data && !data.error) {
        return data as PublicSafetyResponse;
      }
      if (data?.code === 'NOT_FOUND' || error?.message?.includes('not found')) {
        const notFoundErr: any = new Error('Safety ID not found');
        notFoundErr.code = 'NOT_FOUND';
        throw notFoundErr;
      }
    } catch (edgeErr: any) {
      if (edgeErr.code === 'NOT_FOUND') {
        throw edgeErr;
      }
      console.warn('Edge Function public-safety failed or not deployed, trying safe RPC/query fallback:', edgeErr);
    }

    // 2. Second attempt: Safe RPC function 'get_public_safety_profile'
    try {
      const { data: rpcData, error: rpcErr } = await supabase.rpc('get_public_safety_profile', {
        p_safety_id: cleanSafetyId,
      });

      if (!rpcErr && rpcData && !rpcData.error) {
        return rpcData as PublicSafetyResponse;
      }
      if (rpcData?.error === 'NOT_FOUND') {
        const notFoundErr: any = new Error('Safety ID not found');
        notFoundErr.code = 'NOT_FOUND';
        throw notFoundErr;
      }
    } catch (rpcCatchErr: any) {
      if (rpcCatchErr.code === 'NOT_FOUND') {
        throw rpcCatchErr;
      }
      console.warn('Safe RPC fallback unavailable, attempting safe projection client query:', rpcCatchErr);
    }

    // 3. Third fallback: Client-side safe projection (Zero Private Data Exposure)
    const { data: profile, error: profErr } = await supabase
      .from('safety_profiles')
      .select('id, safety_id, profile_type, name, photo_url, status, qr_status')
      .eq('safety_id', cleanSafetyId)
      .maybeSingle();

    if (profErr || !profile) {
      const notFoundErr: any = new Error('Safety ID not found');
      notFoundErr.code = 'NOT_FOUND';
      throw notFoundErr;
    }

    // Handle Suspended / Revoked
    if (profile.qr_status === 'SUSPENDED' || profile.qr_status === 'REVOKED') {
      return {
        safety_id: profile.safety_id,
        profile_type: profile.profile_type,
        status: profile.status,
        qr_status: profile.qr_status,
        name: profile.name,
      };
    }

    if (profile.profile_type === 'DEPENDENT') {
      // Security rule: Only fetch guardian_phone if profile is VERIFIED and active/valid (not suspended/revoked)
      const canAccessContact = 
        profile.status === 'VERIFIED' && 
        profile.qr_status !== 'SUSPENDED' && 
        profile.qr_status !== 'REVOKED';
      const selectFields = [
        'full_name',
        'age',
        'relationship',
        'blood_group',
        'medical_conditions',
        'allergies',
        'special_needs',
        'emergency_instructions',
        ...(canAccessContact ? ['guardian_phone'] : [])
      ].join(', ');

      const { data } = await supabase
        .from('family_safety_profiles')
        .select(selectFields)
        .eq('safety_profile_id', profile.id)
        .maybeSingle();

      const family = data as any;

      // Sanitize phone number strictly for tel: action (preserve leading +, strip other non-digits)
      let sanitizedActionPhone: string | null = null;
      if (canAccessContact && family?.guardian_phone) {
        const raw = String(family.guardian_phone).trim();
        const hasPlus = raw.startsWith('+');
        const digits = raw.replace(/\D/g, '');
        if (digits.length >= 7) {
          sanitizedActionPhone = hasPlus ? `+${digits}` : digits;
        }
      }

      return {
        safety_id: profile.safety_id,
        profile_type: 'DEPENDENT',
        status: profile.status,
        qr_status: profile.qr_status,
        name: family?.full_name || profile.name,
        photo_url: profile.photo_url,
        age: family?.age,
        relationship: family?.relationship,
        blood_group: family?.blood_group,
        emergency_info: {
          critical_allergies: family?.allergies,
          medical_alert: family?.medical_conditions,
          special_assistance: family?.special_needs,
          emergency_instructions: family?.emergency_instructions,
        },
        guardian_action_phone: sanitizedActionPhone,
      };
    } else {
      // ACCESSORY
      const { data: acc } = await supabase
        .from('safety_accessories')
        .select('accessory_name, accessory_type, brand, model, color, description, photo_url')
        .eq('safety_profile_id', profile.id)
        .maybeSingle();

      return {
        safety_id: profile.safety_id,
        profile_type: 'ACCESSORY',
        status: profile.status,
        qr_status: profile.qr_status,
        name: acc?.accessory_name || profile.name,
        photo_url: acc?.photo_url || profile.photo_url,
        accessory: {
          item_name: acc?.accessory_name || profile.name,
          accessory_type: acc?.accessory_type,
          brand: acc?.brand,
          model: acc?.model,
          color: acc?.color,
          description: acc?.description,
        }
      };
    }
  }
};
