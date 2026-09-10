/* StokCerdas — Supabase Client SDK Configuration & Initialization */

// Supabase Project Credentials (Dapat diubah atau disetting via LocalStorage/Environment)
const DEFAULT_SUPABASE_URL = localStorage.getItem('stokcerdas_supabase_url') || 'https://mlykohaduptibyzkhmil.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = localStorage.getItem('stokcerdas_supabase_key') || 'sb_publishable_oJWpflkTRfH-0JqcPunL2w_uugcEAeq';

let supabaseClient = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    if (window.supabase && window.supabase.createClient) {
      try {
        supabaseClient = window.supabase.createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY);
        console.log('⚡ Supabase Client initialized successfully!');
      } catch (e) {
        console.warn('Supabase Client initialization warning:', e.message);
      }
    }
  }
  return supabaseClient;
}

export function isSupabaseConfigured() {
  const url = localStorage.getItem('stokcerdas_supabase_url') || DEFAULT_SUPABASE_URL;
  const key = localStorage.getItem('stokcerdas_supabase_key') || DEFAULT_SUPABASE_ANON_KEY;
  return url && key && !url.includes('YOUR_SUPABASE_PROJECT_ID') && key !== 'YOUR_SUPABASE_ANON_KEY';
}

export function setSupabaseCredentials(url, key) {
  if (url) localStorage.setItem('stokcerdas_supabase_url', url.trim());
  if (key) localStorage.setItem('stokcerdas_supabase_key', key.trim());
  if (window.supabase && window.supabase.createClient) {
    supabaseClient = window.supabase.createClient(url.trim(), key.trim());
  }
}
