-- MargDarshak Family Safety Schema Enhancements & Safe Public Access
-- IMPORTANT: This migration preserves existing tables and data.
-- DO NOT DROP existing tables or overwrite production data.

-- 1. Ensure indexes exist for rapid lookup on Safety IDs and Foreign Keys
CREATE INDEX IF NOT EXISTS idx_safety_profiles_safety_id ON safety_profiles (safety_id);
CREATE INDEX IF NOT EXISTS idx_safety_profiles_status ON safety_profiles (status);
CREATE INDEX IF NOT EXISTS idx_safety_profiles_qr_status ON safety_profiles (qr_status);

CREATE INDEX IF NOT EXISTS idx_family_safety_profiles_profile_id ON family_safety_profiles (safety_profile_id);
CREATE INDEX IF NOT EXISTS idx_safety_accessories_profile_id ON safety_accessories (safety_profile_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_safety_id ON qr_codes (safety_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_profile_id ON qr_codes (safety_profile_id);
CREATE INDEX IF NOT EXISTS idx_qr_scan_events_profile_id ON qr_scan_events (safety_profile_id);
CREATE INDEX IF NOT EXISTS idx_qr_scan_events_scanned_at ON qr_scan_events (scanned_at DESC);

-- 2. Safe Public RPC Function: get_public_safety_profile
-- Allows unauthenticated / public scanner clients to read strictly sanitized public data
-- without granting public SELECT access to private columns like full home address, guardian phone, medications, etc.

CREATE OR REPLACE FUNCTION get_public_safety_profile(p_safety_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile RECORD;
  v_family RECORD;
  v_acc RECORD;
  v_result JSONB;
BEGIN
  -- Lookup safety profile by safety_id
  SELECT id, safety_id, profile_type, name, photo_url, status, qr_status
  INTO v_profile
  FROM safety_profiles
  WHERE safety_id = TRIM(p_safety_id)
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'NOT_FOUND', 'message', 'Safety ID not found');
  END IF;

  -- Handle suspended or revoked states
  IF v_profile.qr_status = 'SUSPENDED' THEN
    RETURN jsonb_build_object(
      'safety_id', v_profile.safety_id,
      'profile_type', v_profile.profile_type,
      'status', v_profile.status,
      'qr_status', 'SUSPENDED',
      'message', 'This MargDarshak Safety QR is temporarily inactive.'
    );
  END IF;

  IF v_profile.qr_status = 'REVOKED' THEN
    RETURN jsonb_build_object(
      'safety_id', v_profile.safety_id,
      'profile_type', v_profile.profile_type,
      'status', v_profile.status,
      'qr_status', 'REVOKED',
      'message', 'This MargDarshak Safety QR has been revoked.'
    );
  END IF;

  -- Build safe payload for DEPENDENT
  IF v_profile.profile_type = 'DEPENDENT' THEN
    SELECT full_name, age, relationship, blood_group, medical_conditions, allergies, special_needs, emergency_instructions
    INTO v_family
    FROM family_safety_profiles
    WHERE safety_profile_id = v_profile.id
    LIMIT 1;

    v_result := jsonb_build_object(
      'safety_id', v_profile.safety_id,
      'profile_type', 'DEPENDENT',
      'status', v_profile.status,
      'qr_status', v_profile.qr_status,
      'name', COALESCE(v_family.full_name, v_profile.name),
      'photo_url', v_profile.photo_url,
      'age', v_family.age,
      'relationship', v_family.relationship,
      'blood_group', v_family.blood_group,
      'emergency_info', jsonb_build_object(
        'critical_allergies', v_family.allergies,
        'medical_alert', v_family.medical_conditions,
        'special_assistance', v_family.special_needs,
        'emergency_instructions', v_family.emergency_instructions
      )
    );
    RETURN v_result;

  -- Build safe payload for ACCESSORY
  ELSE
    SELECT accessory_name, accessory_type, brand, model, color, description, photo_url
    INTO v_acc
    FROM safety_accessories
    WHERE safety_profile_id = v_profile.id
    LIMIT 1;

    v_result := jsonb_build_object(
      'safety_id', v_profile.safety_id,
      'profile_type', 'ACCESSORY',
      'status', v_profile.status,
      'qr_status', v_profile.qr_status,
      'name', COALESCE(v_acc.accessory_name, v_profile.name),
      'photo_url', COALESCE(v_acc.photo_url, v_profile.photo_url),
      'accessory', jsonb_build_object(
        'item_name', COALESCE(v_acc.accessory_name, v_profile.name),
        'accessory_type', v_acc.accessory_type,
        'brand', v_acc.brand,
        'model', v_acc.model,
        'color', v_acc.color,
        'description', v_acc.description
      )
    );
    RETURN v_result;
  END IF;
END;
$$;

-- Grant execution of safe RPC to anonymous scanners
GRANT EXECUTE ON FUNCTION get_public_safety_profile(TEXT) TO anon, authenticated;
