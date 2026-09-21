import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SafetyProfile, QRCodeRecord, QRStatus } from '../types/database';
import { buildSafetyQrPayload } from '../lib/config';

export const qrService = {
  /**
   * Generates a new QR record or retrieves existing one without duplicating.
   */
  async generateOrRetrieveQR(profile: SafetyProfile): Promise<{
    qrRecord: QRCodeRecord;
    isNewlyGenerated: boolean;
  }> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    if (profile.status !== 'VERIFIED') {
      throw new Error('QR code can only be generated for VERIFIED profiles.');
    }

    const payload = buildSafetyQrPayload(profile.safety_id);

    // 1. Check if a valid QR record already exists
    const { data: existing, error: checkError } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('safety_id', profile.safety_id)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing QR:', checkError);
    }

    if (existing) {
      // Re-use existing record
      return {
        qrRecord: existing as QRCodeRecord,
        isNewlyGenerated: false,
      };
    }

    // 2. Insert new QR record
    const now = new Date().toISOString();
    const { data: inserted, error: insertError } = await supabase
      .from('qr_codes')
      .insert({
        safety_profile_id: profile.id,
        safety_id: profile.safety_id,
        qr_payload: payload,
        status: 'GENERATED',
        generated_at: now,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create QR record in database:', insertError);
      throw insertError;
    }

    // 3. Update safety_profiles.qr_status = 'GENERATED'
    const { error: profileUpdateError } = await supabase
      .from('safety_profiles')
      .update({
        qr_status: 'GENERATED'
      })
      .eq('id', profile.id);

    if (profileUpdateError) {
      console.warn('Failed to update safety_profiles qr_status:', profileUpdateError);
    }

    return {
      qrRecord: inserted as QRCodeRecord,
      isNewlyGenerated: true,
    };
  },

  /**
   * Transition QR through its lifecycle:
   * REQUESTED -> GENERATED -> ISSUED -> ACTIVE
   * Or emergency statuses: SUSPENDED, REVOKED
   */
  async updateQRStatus(
    safetyId: string,
    profileId: string,
    newStatus: QRStatus
  ): Promise<void> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const now = new Date().toISOString();
    const qrUpdates: any = {
      status: newStatus,
    };

    if (newStatus === 'ISSUED') {
      qrUpdates.issued_at = now;
    }

    // Update qr_codes
    const { error: qrErr } = await supabase
      .from('qr_codes')
      .update(qrUpdates)
      .eq('safety_id', safetyId);

    if (qrErr) {
      console.error('Failed to update qr_codes table:', qrErr);
      throw qrErr;
    }

    // Update safety_profiles
    const { error: profErr } = await supabase
      .from('safety_profiles')
      .update({
        qr_status: newStatus,
      })
      .eq('id', profileId);

    if (profErr) {
      console.error('Failed to update safety_profiles table:', profErr);
      throw profErr;
    }
  },

  /**
   * Regenerate an existing QR payload (only after explicit confirmation)
   */
  async regenerateQR(safetyId: string, profileId: string): Promise<QRCodeRecord> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const payload = buildSafetyQrPayload(safetyId);
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('qr_codes')
      .update({
        qr_payload: payload,
        status: 'GENERATED',
        generated_at: now,
      })
      .eq('safety_id', safetyId)
      .select()
      .single();

    if (error) {
      console.error('Failed to regenerate QR:', error);
      throw error;
    }

    await supabase
      .from('safety_profiles')
      .update({ qr_status: 'GENERATED' })
      .eq('id', profileId);

    return data as QRCodeRecord;
  }
};
