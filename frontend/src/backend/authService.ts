import { supabase } from "./supabase";
import { DEFAULT_AVATAR } from "@/lib/avatar";
import { mapRowToUser } from "@/lib/auth/mapUser";
import { apiFetch } from "@/lib/api-client";
import { formatSupabaseAuthError } from "@/lib/formatError";

export const USER_UPDATED_EVENT = "pelum-user-updated";

export interface User {
  id_user: string;
  username: string;
  email: string;
  nama_lengkap: string;
  no_telp: string;
  avatar: string;
  role: "customer" | "seller" | "admin";
  created_at: string;
  nama_toko?: string;
  jenis_kelamin?: string;
  tanggal_lahir?: string;
}

export interface ProfileUpdate {
  nama_lengkap?: string;
  no_telp?: string;
  username?: string;
  avatar?: string;
}

const isPlaceholder = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return !url || url.includes("placeholder") || !key || key.includes("placeholder");
};

export type LoginError =
  | "not_found"
  | "wrong_password"
  | "no_password"
  | "email_not_confirmed"
  | "db_error";

export type LoginResult = { user: User | null; error?: LoginError };

export type RegisterResult =
  | { user: User; needsEmailVerification: false }
  | { user: null; needsEmailVerification: true; email: string; notice?: string };

async function fetchProfileFromDb(email: string, authId: string): Promise<User | null> {
  // Run both lookups in parallel for speed
  const [{ data: byEmail }, { data: byId }] = await Promise.all([
    supabase.from("users").select("*").ilike("email", email.trim().toLowerCase()).maybeSingle(),
    supabase.from("users").select("*").eq("id_user", authId).maybeSingle(),
  ]);

  if (byEmail) return mapRowToUser(byEmail);
  if (byId) return mapRowToUser(byId);
  return null;
}

async function syncProfileFromSession(
  accessToken: string,
  metadata?: Record<string, unknown>
): Promise<User | null> {
  const res = await fetch("/api/auth/sync-profile", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ metadata }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.user) {
    const apiErr = typeof data.error === "string" ? data.error : null;
    throw new Error(apiErr || "Gagal menyimpan profil pengguna. Coba masuk atau hubungi admin.");
  }
  return data.user as User;
}

function authRedirectOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

export const authService = {
  isSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    return Boolean(url && !url.includes("placeholder") && key && !key.includes("placeholder"));
  },

  setCurrentUser(user: User | null): void {
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem("pelum_current_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("pelum_current_user");
      }
      window.dispatchEvent(new CustomEvent(USER_UPDATED_EVENT));
    }
  },

  getCurrentUser(): User | null {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("pelum_current_user");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  },

  async refreshSession(): Promise<User | null> {
    if (isPlaceholder()) return this.getCurrentUser();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.email) {
      this.setCurrentUser(null);
      return null;
    }

    let profile = await fetchProfileFromDb(session.user.email, session.user.id);
    if (!profile) {
      profile = await syncProfileFromSession(session.access_token, session.user.user_metadata);
    }

    if (profile) {
      this.setCurrentUser(profile);
      return profile;
    }

    return this.getCurrentUser();
  },

  async login(email: string, password?: string): Promise<LoginResult> {
    const normalizedEmail = email.trim().toLowerCase();

    if (isPlaceholder()) {
      const storedUsers = localStorage.getItem("pelum_users");
      if (storedUsers) {
        const users = JSON.parse(storedUsers) as Array<User & { password?: string }>;
        const user = users.find((u) => u.email?.toLowerCase() === normalizedEmail);
        if (user) {
          if (password && user.password && user.password !== password) {
            return { user: null, error: "wrong_password" };
          }
          const { password: _p, ...safe } = user;
          this.setCurrentUser(safe as User);
          return { user: safe as User };
        }
      }
      return { user: null, error: "not_found" };
    }

    if (!password) {
      return { user: null, error: "wrong_password" };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
          return { user: null, error: "email_not_confirmed" };
        }
        if (msg.includes("invalid login") || msg.includes("invalid credentials")) {
          return { user: null, error: "wrong_password" };
        }
        console.error("Supabase signIn error:", error.message);
        return { user: null, error: "db_error" };
      }

      if (!data.session?.user?.email) {
        return { user: null, error: "db_error" };
      }

      let profile = await fetchProfileFromDb(data.session.user.email, data.session.user.id);
      if (!profile) {
        profile = await syncProfileFromSession(
          data.session.access_token,
          data.session.user.user_metadata
        );
      }

      if (!profile) {
        return { user: null, error: "db_error" };
      }

      this.setCurrentUser(profile);
      return { user: profile };
    } catch (err) {
      console.error("Auth login failed:", err);
      return { user: null, error: "db_error" };
    }
  },

  async loginWithGoogle(): Promise<unknown> {
    if (isPlaceholder()) {
      alert("Google OAuth tidak aktif pada environment lokal tanpa konfigurasi Supabase.");
      return null;
    }
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Google OAuth sign in failed:", err);
      return null;
    }
  },

  async register(
    username: string,
    email: string,
    no_telp: string,
    password?: string,
    tanggal_lahir?: string,
    nama_lengkap?: string
  ): Promise<RegisterResult> {
    const normalizedEmail = email.trim().toLowerCase();
    const displayName = nama_lengkap?.trim() || username;

    if (isPlaceholder()) {
      const newUser: User = {
        id_user:
          typeof crypto !== "undefined"
            ? crypto.randomUUID()
            : `u-${Math.random().toString(36).substr(2, 9)}`,
        username,
        email: normalizedEmail,
        nama_lengkap: displayName,
        no_telp,
        avatar: DEFAULT_AVATAR,
        role: "customer",
        created_at: new Date().toISOString(),
        tanggal_lahir,
      };
      const storedUsers = localStorage.getItem("pelum_users");
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      users.push({ ...newUser, password });
      localStorage.setItem("pelum_users", JSON.stringify(users));
      return { user: newUser, needsEmailVerification: false };
    }

    if (!password || password.length < 8) {
      throw new Error("Kata sandi minimal 8 karakter.");
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: normalizedEmail,
        password,
        username,
        nama_lengkap: displayName,
        no_telp,
        tanggal_lahir,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        typeof data.error === "string" && data.error
          ? data.error
          : formatSupabaseAuthError(data)
      );
    }

    if (data.session?.access_token && data.session?.refresh_token) {
      const { error: sessionErr } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
      if (sessionErr) {
        console.error("setSession after register:", sessionErr.message);
      }
      if (data.user) {
        this.setCurrentUser(data.user as User);
        return { user: data.user as User, needsEmailVerification: false };
      }
    }

    if (data.needsEmailVerification) {
      let notice = typeof data.notice === "string" ? data.notice : undefined;

      // Cadangan dari browser — redirect pakai origin production (bukan localhost)
      if (!data.emailSendFailed) {
        const resend = await this.resendVerificationEmail(normalizedEmail);
        if (!resend.ok) {
          notice =
            notice ||
            `Akun dibuat, tetapi email verifikasi belum terkirim (${resend.error}). ` +
              'Coba tombol "Kirim ulang email verifikasi" atau cek folder spam.';
        }
      }

      return {
        user: null,
        needsEmailVerification: true,
        email: normalizedEmail,
        notice,
      };
    }

    throw new Error("Pendaftaran gagal. Respons server tidak lengkap.");
  },

  async resendVerificationEmail(email: string): Promise<{ ok: boolean; error?: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    if (isPlaceholder()) {
      return { ok: false, error: "Supabase belum dikonfigurasi." };
    }

    const origin = authRedirectOrigin();
    const redirectTo = origin ? `${origin}/auth/callback` : undefined;

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: normalizedEmail,
      ...(redirectTo ? { options: { emailRedirectTo: redirectTo } } : {}),
    });

    if (error) {
      return { ok: false, error: formatSupabaseAuthError(error) };
    }
    return { ok: true };
  },

  async sendPasswordResetEmail(email: string): Promise<boolean> {
    const normalizedEmail = email.trim().toLowerCase();

    if (isPlaceholder()) {
      const storedUsers = localStorage.getItem("pelum_users");
      if (storedUsers) {
        const users = JSON.parse(storedUsers) as Array<{ email: string }>;
        return users.some((u) => u.email.toLowerCase() === normalizedEmail);
      }
      return false;
    }

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${origin}/auth/reset-password`,
    });

    if (error) {
      console.error("resetPasswordForEmail failed:", error.message);
      return false;
    }
    return true;
  },

  async updatePassword(newPassword: string): Promise<boolean> {
    if (isPlaceholder()) return false;
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      console.error("updatePassword failed:", error.message);
      return false;
    }
    return true;
  },

  /** @deprecated gunakan sendPasswordResetEmail */
  async resetPassword(email: string, _newPassword?: string): Promise<boolean> {
    return this.sendPasswordResetEmail(email);
  },

  async checkEmailExists(email: string): Promise<boolean> {
    const normalizedEmail = email.trim().toLowerCase();

    if (isPlaceholder()) {
      const storedUsers = localStorage.getItem("pelum_users");
      if (storedUsers) {
        const users = JSON.parse(storedUsers) as Array<{ email: string }>;
        return users.some((u) => u.email.toLowerCase() === normalizedEmail);
      }
      return false;
    }

    const { data } = await supabase
      .from("users")
      .select("email")
      .ilike("email", normalizedEmail)
      .maybeSingle();

    return Boolean(data);
  },

  async uploadAvatar(file: File, userId: string): Promise<string> {
    if (file.size > 1 * 1024 * 1024) {
      throw new Error("Ukuran gambar maksimal 1 MB.");
    }

    if (isPlaceholder()) {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string) || DEFAULT_AVATAR);
        reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
        reader.readAsDataURL(file);
      });
    }

    const form = new FormData();
    form.append("userId", userId);
    form.append("file", file);

    const res = await apiFetch("/api/account/avatar", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Gagal mengunggah foto profil.");
    }
    if (!data.url) throw new Error("Gagal mendapatkan URL foto profil.");
    return data.url as string;
  },

  async updateProfile(
    id_user: string,
    nama_lengkap: string,
    no_telp: string,
    extra?: ProfileUpdate
  ): Promise<boolean> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return false;

    const fields: ProfileUpdate = {
      nama_lengkap,
      no_telp,
      ...extra,
    };

    const updatedUser: User = { ...currentUser, ...fields };

    if (isPlaceholder()) {
      this.setCurrentUser(updatedUser);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(USER_UPDATED_EVENT));
      }
      return true;
    }

    try {
      const supabaseFields: Record<string, string> = {};
      if (fields.nama_lengkap !== undefined) supabaseFields.nama_lengkap = fields.nama_lengkap;
      if (fields.no_telp !== undefined) supabaseFields.no_telp = fields.no_telp;
      if (fields.username !== undefined) supabaseFields.username = fields.username;
      if (fields.avatar !== undefined) supabaseFields.avatar = fields.avatar;

      const { error } = await supabase
        .from("users")
        .update(supabaseFields)
        .eq("id_user", id_user);

      if (error) {
        console.error("Supabase update profile failed:", error.message);
        return false;
      }

      this.setCurrentUser(updatedUser);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(USER_UPDATED_EVENT));
      }
      return true;
    } catch (err) {
      console.error("Auth updateProfile failed:", err);
      return false;
    }
  },

  async logout(): Promise<void> {
    if (!isPlaceholder()) {
      await supabase.auth.signOut();
    }
    this.setCurrentUser(null);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(USER_UPDATED_EVENT));
    }
  },
};
