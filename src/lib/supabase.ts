import { createClient } from '@supabase/supabase-js';
import { CONFIG } from './config';

// Safe initialization of Supabase client with publishable/anon key
const supabaseUrl = CONFIG.SUPABASE_URL;
const supabaseAnonKey = CONFIG.SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured = Boolean(
  CONFIG.SUPABASE_URL && 
  CONFIG.SUPABASE_ANON_KEY && 
  CONFIG.SUPABASE_ANON_KEY !== 'placeholder-anon-key' &&
  CONFIG.SUPABASE_ANON_KEY.length > 20
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
