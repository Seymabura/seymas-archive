export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const X_HANDLE = (process.env.NEXT_PUBLIC_X_HANDLE ?? "").replace(/^@/, "");
export const BUCKET = "memes";

export const isConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Sitenin asıl adresi: elle verilmişse onu, yoksa Vercel'in kalıcı yayın adresini kullan.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const SITE_NAME = "Seyma's Archive";
export const SITE_TAGLINE = "Türk internetinin caps arşivi";
