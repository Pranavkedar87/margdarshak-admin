// Database TypeScript definitions matching MargDarshak Supabase Schema

export type ProfileStatus = 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED' | 'REVOKED';

export type QRStatus = 'PENDING' | 'REQUESTED' | 'GENERATED' | 'ISSUED' | 'ACTIVE' | 'SUSPENDED' | 'REVOKED';

export type ProfileType = 'DEPENDENT' | 'ACCESSORY';

export interface SafetyProfile {
  id: string; // UUID primary key
  owner_user_id?: string;
  safety_id: string; // Human readable, e.g., MD-FM-2026-384920 or MD-ACC-2026-582194
  profile_type: ProfileType;
  name: string;
  photo_url?: string | null;
  status: ProfileStatus;
  qr_status: QRStatus;
  last_scanned_at?: string | null;
  last_scan_latitude?: number | null;
  last_scan_longitude?: number | null;
  last_scan_location?: string | null;
  created_at: string;
  // Joined fields
  family_profile?: FamilySafetyProfile | null;
  accessory?: SafetyAccessory | null;
  qr_code?: QRCodeRecord | null;
}

export interface FamilySafetyProfile {
  id?: string;
  safety_profile_id: string;
  full_name: string;
  age?: number | null;
  gender?: string | null;
  relationship?: string | null;
  mobile?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  blood_group?: string | null;
  medical_conditions?: string | null;
  allergies?: string | null;
  medications?: string | null;
  special_needs?: string | null;
  emergency_instructions?: string | null;
  guardian_name?: string | null;
  guardian_relationship?: string | null;
  guardian_phone?: string | null;
  secondary_contact_name?: string | null;
  secondary_contact_phone?: string | null;
}

export interface SafetyAccessory {
  id?: string;
  safety_profile_id: string;
  accessory_name: string;
  accessory_type?: string | null;
  brand?: string | null;
  model?: string | null;
  color?: string | null;
  serial_number?: string | null;
  description?: string | null;
  photo_url?: string | null;
}

export interface QRCodeRecord {
  id: string;
  safety_profile_id: string;
  safety_id: string;
  qr_payload: string; // ONLY: https://margdarshak.app/safety/{safety_id}
  status: QRStatus;
  generated_at?: string | null;
  issued_at?: string | null;
}

export interface QRScanEvent {
  id: string;
  safety_profile_id?: string | null;
  safety_id?: string | null;
  latitude: number | null;
  longitude: number | null;
  location_name?: string | null;
  scanned_at: string;
  scanner_user_agent?: string | null;
  status?: string | null;
  // Joined for admin presentation
  safety_profile?: {
    name: string;
    safety_id: string;
    profile_type: ProfileType;
    photo_url?: string | null;
  } | null;
}

// Public response model - STRICTLY SANITIZED for privacy
export interface PublicSafetyResponse {
  safety_id: string;
  profile_type: ProfileType;
  status: ProfileStatus;
  qr_status: QRStatus;
  name: string;
  photo_url?: string | null;
  // Dependent safe fields
  age?: number | null;
  gender?: string | null;
  relationship?: string | null;
  blood_group?: string | null;
  district?: string | null;
  guardian_name?: string | null;
  guardian_relationship?: string | null;
  guardian_action_phone?: string | null;
  secondary_contact_name?: string | null;
  secondary_contact_relationship?: string | null;
  secondary_contact_action_phone?: string | null;
  emergency_info?: {
    critical_allergies?: string | null;
    medical_alert?: string | null;
    special_assistance?: string | null;
    emergency_instructions?: string | null;
  } | null;
  // Telemetry safe fields
  last_scanned_at?: string | null;
  last_scan_latitude?: number | null;
  last_scan_longitude?: number | null;
  last_scan_location?: string | null;
  // Accessory safe fields
  accessory?: {
    item_name: string;
    accessory_type?: string | null;
    brand?: string | null;
    model?: string | null;
    color?: string | null;
    description?: string | null;
  } | null;
}
