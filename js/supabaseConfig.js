/* StokCerdas — Supabase Client SDK Configuration & Initialization */

const LIVE_SUPABASE_URL = 'https://mlykohaduptibyzkhmil.supabase.co';
const LIVE_SUPABASE_ANON_KEY = 'sb_publishable_oJWpflkTRfH-0JqcPunL2w_uugcEAeq';

export function getSupabaseUrl() {
  const stored = localStorage.getItem('stokcerdas_supabase_url');
  if (stored && stored.trim() && !stored.includes('YOUR_SUPABASE_PROJECT_ID')) {
    return stored.trim();
  }
  return LIVE_SUPABASE_URL;
}

export function getSupabaseKey() {
  const stored = localStorage.getItem('stokcerdas_supabase_key');
  if (stored && stored.trim() && stored !== 'YOUR_SUPABASE_ANON_KEY') {
    return stored.trim();
  }
  return LIVE_SUPABASE_ANON_KEY;
}

let supabaseClient = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    if (window.supabase && window.supabase.createClient) {
      try {
        const url = getSupabaseUrl();
        const key = getSupabaseKey();
        supabaseClient = window.supabase.createClient(url, key);
        console.log('⚡ Supabase Client initialized successfully for URL:', url);
      } catch (e) {
        console.warn('Supabase Client initialization warning:', e.message);
      }
    }
  }
  return supabaseClient;
}

export function isSupabaseConfigured() {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  return Boolean(url && key && !url.includes('YOUR_SUPABASE_PROJECT_ID') && key !== 'YOUR_SUPABASE_ANON_KEY');
}

export function setSupabaseCredentials(url, key) {
  if (url) localStorage.setItem('stokcerdas_supabase_url', url.trim());
  if (key) localStorage.setItem('stokcerdas_supabase_key', key.trim());
  if (window.supabase && window.supabase.createClient) {
    supabaseClient = window.supabase.createClient(url ? url.trim() : getSupabaseUrl(), key ? key.trim() : getSupabaseKey());
  }
}
