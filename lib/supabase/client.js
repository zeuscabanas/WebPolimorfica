import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ||
    (typeof window !== 'undefined' ? window.__SB_URL__ : undefined);
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    (typeof window !== 'undefined' ? window.__SB_KEY__ : undefined);
  return createBrowserClient(url, key);
}
