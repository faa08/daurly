import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase-config";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

if (!isSupabaseConfigured()) {
  const msg =
    "[Pelum] Supabase TIDAK terhubung — pakai placeholder. Set env di Vercel: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY";
  if (process.env.NODE_ENV === "production") {
    console.error(msg);
  } else {
    console.warn(msg);
  }
} else if (process.env.NODE_ENV === "development") {
  console.log("Supabase Client initialized with:", supabaseUrl);
}
