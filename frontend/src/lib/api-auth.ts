import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { mapRowToUser } from "@/lib/auth/mapUser";
import type { User } from "@/backend/authService";

export type AuthContext = {
  authUserId: string;
  email: string;
  user: User;
  admin: SupabaseClient;
};

export function unauthorized(message = "Sesi tidak valid. Silakan masuk kembali.") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "Akses ditolak.") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function getBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  return authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
}

export async function requireAuth(
  request: NextRequest
): Promise<{ ok: true; ctx: AuthContext } | { ok: false; response: NextResponse }> {
  const token = getBearerToken(request);
  if (!token) {
    return { ok: false, response: unauthorized("Token tidak ditemukan.") };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || url.includes("placeholder") || !anonKey) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Supabase tidak dikonfigurasi." }, { status: 503 }),
    };
  }

  const { client: admin, error: adminErr } = createSupabaseAdmin();
  if (!admin) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: adminErr || "Service role tidak tersedia." },
        { status: 503 }
      ),
    };
  }

  const authClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user: authUser },
    error: authError,
  } = await authClient.auth.getUser(token);

  if (authError || !authUser?.id) {
    return { ok: false, response: unauthorized() };
  }

  let { data: dbRow } = await admin
    .from("users")
    .select("*")
    .eq("id_user", authUser.id)
    .maybeSingle();

  if (!dbRow && authUser.email) {
    const { data: byEmail } = await admin
      .from("users")
      .select("*")
      .ilike("email", authUser.email.trim().toLowerCase())
      .maybeSingle();
    dbRow = byEmail;
  }

  if (!dbRow) {
    return { ok: false, response: unauthorized("Profil pengguna tidak ditemukan.") };
  }

  if (dbRow.is_suspended) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Akun Anda telah ditangguhkan karena melanggar ketentuan." },
        { status: 403 }
      ),
    };
  }

  return {
    ok: true,
    ctx: {
      authUserId: authUser.id,
      email: authUser.email || dbRow.email,
      user: mapRowToUser(dbRow),
      admin,
    },
  };
}

export async function requireAdmin(
  request: NextRequest
): Promise<{ ok: true; ctx: AuthContext } | { ok: false; response: NextResponse }> {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth;
  if (auth.ctx.user.role !== "admin") {
    return { ok: false, response: forbidden("Hanya admin yang dapat mengakses.") };
  }
  return auth;
}

export function denyForeignUser(
  ctx: AuthContext,
  userId: string | null | undefined
): NextResponse | null {
  if (userId && userId !== ctx.user.id_user) {
    return forbidden("Tidak dapat mengakses data pengguna lain.");
  }
  return null;
}

export async function verifyOrderOwnership(
  admin: SupabaseClient,
  orderIds: string[],
  userId: string
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  const { data, error } = await admin
    .from("order")
    .select("id_order, id_user")
    .in("id_order", orderIds);

  if (error) {
    return {
      ok: false,
      response: NextResponse.json({ error: error.message }, { status: 500 }),
    };
  }

  if (!data?.length || data.length !== orderIds.length) {
    return { ok: false, response: forbidden("Pesanan tidak ditemukan.") };
  }

  if (data.some((row) => row.id_user !== userId)) {
    return { ok: false, response: forbidden("Pesanan bukan milik Anda.") };
  }

  return { ok: true };
}

export async function verifyOrderChatAccess(
  admin: SupabaseClient,
  chatId: string,
  userId: string,
  isAdmin: boolean
): Promise<boolean> {
  const { data } = await admin
    .from("order_chat")
    .select("id_user")
    .eq("id_chat", chatId)
    .maybeSingle();
  if (!data) return false;
  return isAdmin || data.id_user === userId;
}

export async function verifySupportChatAccess(
  admin: SupabaseClient,
  chatId: string,
  userId: string,
  isAdmin: boolean
): Promise<boolean> {
  const { data } = await admin
    .from("support_chat")
    .select("id_user")
    .eq("id_chat", chatId)
    .maybeSingle();
  if (!data) return false;
  return isAdmin || data.id_user === userId;
}

export async function verifyReturnChatAccess(
  admin: SupabaseClient,
  chatId: string,
  userId: string,
  isAdmin: boolean
): Promise<boolean> {
  const { data } = await admin
    .from("return_chat")
    .select("id_user")
    .eq("id_chat", chatId)
    .maybeSingle();
  if (!data) return false;
  return isAdmin || data.id_user === userId;
}
