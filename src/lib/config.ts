// Application runtime configuration

export const CONFIG = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://jcinlxylijhteujzxyow.supabase.co',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  // Default to GitHub Pages deployment for hackathon
  PUBLIC_APP_URL: (import.meta.env.VITE_PUBLIC_APP_URL || 'https://pranavkedar87.github.io/margdarshak-admin').replace(/\/$/, ''),
};

/**
 * Build the exact, strict QR payload for a given Safety ID.
 * Standard format: https://margdarshak.app/safety/{safety_id}
 */
export function buildSafetyQrPayload(safetyId: string): string {
  const sanitizedId = encodeURIComponent(safetyId.trim());
  return `${CONFIG.PUBLIC_APP_URL}/safety/${sanitizedId}`;
}
