// Application runtime configuration

export const CONFIG = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://jcinxlylijhteujzxyow.supabase.co',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  // Default to production domain, fallback to current origin if in dev and not specified
  PUBLIC_APP_URL: (import.meta.env.VITE_PUBLIC_APP_URL || 'https://margdarshak.app').replace(/\/$/, ''),
};

/**
 * Build the exact, strict QR payload for a given Safety ID.
 * Standard format: https://margdarshak.app/safety/{safety_id}
 */
export function buildSafetyQrPayload(safetyId: string): string {
  const sanitizedId = encodeURIComponent(safetyId.trim());
  return `${CONFIG.PUBLIC_APP_URL}/safety/${sanitizedId}`;
}
