/** Apakah Supabase dikonfigurasi (bukan placeholder) */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return Boolean(
    url &&
      !url.includes("placeholder") &&
      key &&
      !key.includes("placeholder")
  );
}

export function getSupabaseConfigError(): string | null {
  if (isSupabaseConfigured()) return null;
  if (typeof window === "undefined") {
    return "Supabase belum dikonfigurasi. Set NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di Vercel Environment Variables, lalu redeploy.";
  }
  return "Database belum terhubung. Environment variable Supabase belum diset di server production.";
}
