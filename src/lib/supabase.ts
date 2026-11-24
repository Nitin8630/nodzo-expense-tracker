import { createClient } from '@supabase/supabase-js';

// Get credentials from localStorage or environment variables
const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('nodzo_supabase_url') : null;
const storedKey = typeof window !== 'undefined' ? localStorage.getItem('nodzo_supabase_anon_key') : null;

const supabaseUrl = storedUrl || import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = storedKey || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function updateSupabaseConfig(url: string, key: string) {
  if (url && key) {
    localStorage.setItem('nodzo_supabase_url', url);
    localStorage.setItem('nodzo_supabase_anon_key', key);
    window.location.reload();
  } else {
    localStorage.removeItem('nodzo_supabase_url');
    localStorage.removeItem('nodzo_supabase_anon_key');
    window.location.reload();
  }
}

export function getSupabaseCredentials() {
  return {
    url: typeof window !== 'undefined' ? localStorage.getItem('nodzo_supabase_url') || import.meta.env.VITE_SUPABASE_URL || '' : '',
    anonKey: typeof window !== 'undefined' ? localStorage.getItem('nodzo_supabase_anon_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '' : '',
    isConfigured: isSupabaseConfigured
  };
}
