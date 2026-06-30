import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { DEFAULT_AVATAR } from "@/lib/avatar";
import { mapRowToUser } from "@/lib/auth/mapUser";
import { formatSupabaseAuthError } from "@/lib/formatError";

type GoTrueSignupResponse = {
  id?: string;
  user?: {
    id?: string;
    email?: string;
    email_confirmed_at?: string | null;
    identities?: { id: string }[];
  };
  session?: {
    access_token: string;
    refresh_token: string;
  };
  access_token?: string;
  refresh_token?: string;
  msg?: string;
  message?: string;
  error?: string;
  error_description?: string;
  code?: string | number;
  error_code?: string;
};

/** Default: wajib verifikasi email sebelum login (jangan auto-login setelah daftar). */
function requiresEmailVerification(): boolean {
  return process.env.REQUIRE_EMAIL_VERIFICATION !== "false";
}

function siteRedirectUrl(request: NextRequest): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  const origin = fromEnv || request.nextUrl.origin;
  return `${origin}/auth/callback`;
}

function goTrueErrorText(body: GoTrueSignupResponse): string {
  return `${body.msg || ""} ${body.message || ""} ${body.error || ""} ${body.error_description || ""}`.toLowerCase();
}

function isEmailSendFailure(body: GoTrueSignupResponse): boolean {
  const text = goTrueErrorText(body);
  return (
    text.includes("confirmation email") ||
    text.includes("sending email") ||
    text.includes("error sending")
  );
}

async function ensureUserProfile(
  admin: SupabaseClient,
  authUserId: string,
  email: string,
  username: string,
  nama_lengkap: string,
  no_telp: string
) {
  const finalUsername =
    username || `${email.split("@")[0]}_${Math.random().toString(36).slice(2, 6)}`;

  const { data: existingProfile } = await admin
    .from("users")
    .select("*")
    .ilike("email", email)
    .maybeSingle();

  if (existingProfile) return existingProfile;

  const { data: created, error: insertError } = await admin
    .from("users")
    .insert({
      id_user: authUserId,
      username: finalUsername,
      email,
      nama_lengkap: nama_lengkap || finalUsername,
      no_telp: no_telp || null,
      avatar: DEFAULT_AVATAR,
      role: "customer",
      password: null,
    })
    .select("*")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      const { data: byEmail } = await admin
        .from("users")
        .select("*")
        .ilike("email", email)
        .maybeSingle();
      return byEmail;
    }
    throw new Error(insertError.message);
  }

  return created;
}

async function findAuthUserIdByEmail(
  admin: SupabaseClient,
  email: string
): Promise<string | null> {
  const { data: listData } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = listData?.users?.find((u) => u.email?.toLowerCase() === email);
  return existing?.id ?? null;
}

async function resendSignupEmail(
  supabaseUrl: string,
  anonKey: string,
  email: string,
  redirectTo: string
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(`${supabaseUrl.replace(/\/$/, "")}/auth/v1/resend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify({
      type: "signup",
      email,
      options: { email_redirect_to: redirectTo },
    }),
  });

  const body = (await res.json().catch(() => ({}))) as {
    msg?: string;
    message?: string;
    error?: string;
    error_description?: string;
  };

  if (!res.ok) {
    const err =
      body.msg ||
      body.message ||
      body.error_description ||
      body.error ||
      `HTTP ${res.status}`;
    return { ok: false, error: err };
  }

  return { ok: true };
}

/**
 * Supabase kadang buat user tapi gagal kirim email — jangan auto-konfirmasi.
 * Simpan profil + minta user verifikasi lewat email (resend).
 */
async function handleEmailSendFailure(
  admin: SupabaseClient,
  supabaseUrl: string,
  anonKey: string,
  email: string,
  username: string,
  nama_lengkap: string,
  no_telp: string,
  redirectTo: string
): Promise<{ ok: true } | null> {
  const authUserId = await findAuthUserIdByEmail(admin, email);
  if (!authUserId) return null;

  await ensureUserProfile(admin, authUserId, email, username, nama_lengkap, no_telp);
  const resend = await resendSignupEmail(supabaseUrl, anonKey, email, redirectTo);
  if (!resend.ok) {
    console.warn("resend signup after email failure:", resend.error, { email, redirectTo });
  }

  return { ok: true };
}

export async function POST(request: NextRequest) {
  const { client: admin, error: configError } = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      {
        error:
          configError ||
          "Server belum dikonfigurasi (SUPABASE_SERVICE_ROLE_KEY). Hubungi admin.",
      },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const password = String(body.password || "");
  const username = String(body.username || "").trim();
  const nama_lengkap = String(body.nama_lengkap || body.name || username).trim();
  const no_telp = String(body.no_telp || "").trim();

  if (!email) {
    return NextResponse.json({ error: "Email wajib diisi." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Kata sandi minimal 8 karakter." }, { status: 400 });
  }
  if (nama_lengkap.length < 2) {
    return NextResponse.json({ error: "Nama lengkap minimal 2 karakter." }, { status: 400 });
  }
  const phoneDigits = no_telp.replace(/\D/g, "");
  if (phoneDigits.length < 10 || phoneDigits.length > 15) {
    return NextResponse.json({ error: "Nomor telepon wajib (10–15 digit)." }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: "Supabase URL/anon key belum dikonfigurasi." }, { status: 503 });
  }

  const redirectTo = siteRedirectUrl(request);
  const signupUrl = `${supabaseUrl.replace(/\/$/, "")}/auth/v1/signup?redirect_to=${encodeURIComponent(redirectTo)}`;
  const metadata = { username, nama_lengkap, no_telp };

  const signupRes = await fetch(signupUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify({
      email,
      password,
      data: metadata,
    }),
  });

  const signupBody = (await signupRes.json().catch(() => ({}))) as GoTrueSignupResponse;

  if (!signupRes.ok) {
    if (isEmailSendFailure(signupBody)) {
      const recovered = await handleEmailSendFailure(
        admin,
        supabaseUrl,
        anonKey,
        email,
        username,
        nama_lengkap,
        no_telp,
        redirectTo
      );
      if (recovered) {
        return NextResponse.json({
          needsEmailVerification: true,
          email,
          notice:
            "Akun dibuat. Email verifikasi dikirim ulang — cek inbox/spam lalu klik link sebelum masuk.",
        });
      }
    }

    const errMsg = formatSupabaseAuthError({
      message: signupBody.msg || signupBody.message || signupBody.error_description,
      code: signupBody.error_code || String(signupBody.code || ""),
      status: signupRes.status,
      error: signupBody.error,
    });
    console.error("register GoTrue failed:", signupRes.status, signupBody);
    return NextResponse.json({ error: errMsg }, { status: signupRes.status });
  }

  const authUserId = signupBody.user?.id || signupBody.id;
  const identities = signupBody.user?.identities;

  if (signupBody.user && (!identities || identities.length === 0)) {
    return NextResponse.json(
      { error: "Email sudah terdaftar! Silakan masuk atau gunakan email lain." },
      { status: 409 }
    );
  }

  if (!authUserId) {
    return NextResponse.json(
      { error: "Pendaftaran gagal: ID pengguna tidak diterima dari Supabase." },
      { status: 500 }
    );
  }

  try {
    await ensureUserProfile(admin, authUserId, email, username, nama_lengkap, no_telp);
  } catch (profileErr) {
    const msg = profileErr instanceof Error ? profileErr.message : "Profil gagal disimpan.";
    console.error("register profile insert:", profileErr);
    return NextResponse.json({ error: `Profil gagal disimpan: ${msg}` }, { status: 500 });
  }

  const accessToken =
    signupBody.session?.access_token || signupBody.access_token || null;
  const refreshToken =
    signupBody.session?.refresh_token || signupBody.refresh_token || null;
  const emailConfirmed = Boolean(signupBody.user?.email_confirmed_at);

  // Hanya auto-login jika verifikasi email tidak wajib DAN Supabase sudah konfirmasi
  if (
    !requiresEmailVerification() &&
    accessToken &&
    refreshToken &&
    emailConfirmed
  ) {
    const { data: profile } = await admin
      .from("users")
      .select("*")
      .eq("id_user", authUserId)
      .maybeSingle();

    return NextResponse.json({
      needsEmailVerification: false,
      session: { access_token: accessToken, refresh_token: refreshToken },
      user: profile ? mapRowToUser(profile) : null,
    });
  }

  let notice: string | undefined;
  if (!emailConfirmed && requiresEmailVerification()) {
    const resend = await resendSignupEmail(supabaseUrl, anonKey, email, redirectTo);
    if (!resend.ok) {
      console.error("register: verification email not sent", resend.error, { email, redirectTo });
      notice =
        `Akun dibuat, tetapi email verifikasi gagal dikirim (${resend.error}). ` +
        "Cek folder spam, pastikan SMTP Supabase aktif, atau gunakan tombol kirim ulang.";
    }
  }

  return NextResponse.json({
    needsEmailVerification: true,
    email,
    ...(notice ? { notice, emailSendFailed: true } : {}),
  });
}
