import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function projectRefFromUrl(url: string): string | null {
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  return match?.[1] ?? null;
}

function projectRefFromJwt(key: string): string | null {
  try {
    const payload = JSON.parse(atob(key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.ref === "string" ? payload.ref : null;
  } catch {
    return null;
  }
}

/**
 * Client Supabase dengan service_role — hanya untuk server (API routes).
 * Bypass RLS sehingga operasi admin (tambah toko, dll.) tidak diblokir policy.
 */
export function createSupabaseAdmin(): {
  client: SupabaseClient | null;
  error: string | null;
} {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

  if (!url || url.includes("placeholder") || !serviceKey) {
    return { client: null, error: "SUPABASE_SERVICE_ROLE_KEY belum diset di .env.local" };
  }

  const urlRef = projectRefFromUrl(url);
  const keyRef = projectRefFromJwt(serviceKey);
  if (urlRef && keyRef && urlRef !== keyRef) {
    return {
      client: null,
      error: `Key dari project "${keyRef}" tidak cocok dengan URL project "${urlRef}". Samakan keduanya di .env.local.`,
    };
  }

  return {
    client: createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
    error: null,
  };
}
