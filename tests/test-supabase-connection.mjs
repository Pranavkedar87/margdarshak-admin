import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://jcinxlylijhteujzxyow.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

console.log('Testing Supabase Connection...');
console.log('URL:', supabaseUrl);
console.log('Anon Key Present:', Boolean(supabaseAnonKey && supabaseAnonKey.trim().length > 10));

if (!supabaseAnonKey || supabaseAnonKey.trim() === '') {
  console.error('RESULT: FAIL — VITE_SUPABASE_ANON_KEY is empty in .env');
  process.exit(1);
}

try {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error, count } = await supabase
    .from('safety_profiles')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('RESULT: FAIL — Supabase Query Error:', error.message || error);
    process.exit(1);
  }

  console.log('RESULT: PASS — Connected to Supabase. safety_profiles count:', count);
} catch (err) {
  console.error('RESULT: FAIL — Network/Connection Exception:', err.message || err);
  process.exit(1);
}
