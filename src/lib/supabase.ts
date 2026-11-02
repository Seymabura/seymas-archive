import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isConfigured } from "./config";

let browserClient: SupabaseClient | null = null;

/** Tarayıcıda kullanılan tek istemci (giriş oturumunu saklar). */
export function getBrowserClient(): SupabaseClient | null {
  if (!isConfigured) return null;
  if (!browserClient) {
    browserClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return browserClient;
}

/** Sunucuda herkese açık veriyi okumak için oturumsuz istemci. */
export function getServerClient(accessToken?: string): SupabaseClient | null {
  if (!isConfigured) return null;
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
  });
}
