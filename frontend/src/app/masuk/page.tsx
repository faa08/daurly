"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { authService } from "@/backend/authService";

const C = {
  primary: "#16A34A",
  primaryDark: "#15803D",
  primaryPale: "#F0FDF4",
  border: "#EAE5E0",
  borderStrong: "#D5CFC9",
  text: "#1F1B18",
  textSec: "#5C5550",
  textMuted: "#8E8680",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    const redirectTo = searchParams.get("redirect");
    if (currentUser) {
      if (redirectTo) {
        router.push(redirectTo);
      } else if (currentUser.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/account/profile");
      }
    }
  }, [router, searchParams]);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "oauth_failed") setErrorMsg("Login gagal. Silakan coba lagi.");
    if (err === "profile_sync_failed") setErrorMsg("Verifikasi berhasil tapi gagal sinkron profil. Coba masuk lagi.");
    if (err === "no_supabase") setErrorMsg("Login tidak tersedia — Supabase belum dikonfigurasi.");
    const msg = searchParams.get("msg");
    if (msg === "please_login") setErrorMsg("Silakan login terlebih dahulu untuk mengakses halaman tersebut.");
    if (msg === "logged_out") setErrorMsg("Anda telah berhasil logout.");
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim()) {
      setErrorMsg("Alamat email wajib diisi.");
      return;
    }
    if (!password.trim()) {
      setErrorMsg("Kata sandi wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const { user, error: loginError } = await authService.login(email, password);
      if (user) {
        const redirectTo = searchParams.get("redirect");
        if (redirectTo) {
          router.push(redirectTo);
        } else if (user.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/account/profile");
        }
      } else {
        if (!authService.isSupabaseConfigured()) {
          setErrorMsg("Supabase belum dikonfigurasi. Buat file frontend/.env.local dari .env.example dan isi URL + API key Supabase Anda, lalu restart server.");
        } else if (loginError === "not_found") {
          setErrorMsg("Email belum terdaftar. Daftar akun baru atau jalankan seed admin di Supabase SQL Editor.");
        } else if (loginError === "email_not_confirmed") {
          setErrorMsg("Email belum diverifikasi. Cek inbox/spam atau kirim ulang link verifikasi.");
        } else if (loginError === "wrong_password") {
          setErrorMsg("Kata sandi salah. Periksa kembali password Anda.");
        } else if (loginError === "no_password") {
          setErrorMsg("Akun ini belum punya password. Gunakan fitur lupa password atau reset via Supabase.");
        } else {
          setErrorMsg("Gagal menghubungi database. Coba lagi atau periksa koneksi Supabase.");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat login. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F0EDEA", display: "flex", flexDirection: "column" }}>

      {/* ── Navbar ── */}
      <Navbar />

      {/* ── Main Card ── */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div className="auth-split-card">
          {/* ── Left Panel ── */}
          <div className="auth-split-left" style={{
            background: C.primaryPale,
            padding: "40px 36px",
          }}>
            {/* Accent line */}
            <div style={{ width: 40, height: 4, background: C.primary, borderRadius: 2 }} />

            <div>
              <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: C.text, lineHeight: 1.25, margin: "0 0 6px 0" }}>
                Dukung Daur Ulang
              </h2>
              <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: C.primary, lineHeight: 1.25, margin: "0 0 16px 0" }}>
                Kreatif Anda
              </h2>
              <p style={{ fontSize: "0.875rem", color: C.textSec, lineHeight: 1.6, margin: 0 }}>
                Masuk ke ekosistem digital Daurly dan mulai kelola toko Anda dengan fitur modern yang dirancang untuk pertumbuhan ramah lingkungan.
              </p>
            </div>

            {/* Artisan Photo */}
            <div style={{
              position: "relative",
              width: "100%",
              borderRadius: 10,
              overflow: "hidden",
              aspectRatio: "4/3",
              marginTop: "auto",
            }}>
              <Image src="/login-artisan.png" alt="Perajin Daur Ulang" fill style={{ objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 60%)" }} />
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div className="auth-split-right" style={{
            background: "white",
            borderLeft: `1px solid ${C.border}`,
            padding: "48px 40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}>
            <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: C.text, margin: "0 0 6px 0" }}>Selamat Datang Kembali</h1>
            <p style={{ fontSize: "0.875rem", color: C.textMuted, margin: "0 0 24px 0" }}>Silakan masukkan detail akun Anda untuk masuk.</p>

            {errorMsg && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: "0.8125rem", color: "#DC2626", fontWeight: 600 }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Email */}
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: C.text, marginBottom: 8 }}>
                  Alamat Email
                </label>
                <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${C.borderStrong}`, borderRadius: 8, overflow: "hidden", background: "white", height: 48 }}>
                  <span style={{ padding: "0 14px", color: C.textMuted, display: "flex", alignItems: "center" }}>
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrorMsg(""); }}
                    disabled={loading}
                    style={{ flex: 1, border: "none", outline: "none", height: "100%", fontSize: "0.875rem", color: C.text, fontFamily: "inherit", background: "transparent" }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label style={{ fontSize: "0.8125rem", fontWeight: 700, color: C.text }}>Kata Sandi</label>
                  <Link href="/lupa-sandi" style={{ fontSize: "0.75rem", fontWeight: 600, color: C.primary, textDecoration: "none" }}>Lupa Password?</Link>
                </div>
                <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${C.borderStrong}`, borderRadius: 8, overflow: "hidden", background: "white", height: 48 }}>
                  <span style={{ padding: "0 14px", color: C.textMuted, display: "flex", alignItems: "center" }}>
                    <Lock size={16} />
                  </span>
                  <input
                    className="auth-password-input"
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrorMsg(""); }}
                    disabled={loading}
                    style={{ flex: 1, border: "none", outline: "none", height: "100%", fontSize: "0.875rem", color: C.text, fontFamily: "inherit", background: "transparent" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{ padding: "0 14px", background: "none", border: "none", cursor: "pointer", color: C.textMuted, display: "flex", alignItems: "center", height: "100%" }}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  disabled={loading}
                  style={{ width: 16, height: 16, accentColor: C.primary, cursor: "pointer" }}
                />
                <span style={{ fontSize: "0.8125rem", color: C.textSec }}>Ingat saya untuk login berikutnya</span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%", height: 48, background: loading ? C.primaryDark : C.primary, color: "white",
                  border: "none", borderRadius: 8, fontSize: "0.875rem", fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
                  opacity: loading ? 0.8 : 1,
                  transition: "all 0.2s ease",
                }}
              >
                {loading ? "Memproses..." : "MASUK SEKARANG"}
              </button>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1, height: 1, background: C.border }} />
                <span style={{ fontSize: "0.75rem", color: C.textMuted, whiteSpace: "nowrap" }}>atau masuk dengan</span>
                <div style={{ flex: 1, height: 1, background: C.border }} />
              </div>

              {/* Social Logins */}
              <button
                type="button"
                onClick={() => authService.loginWithGoogle()}
                disabled={loading}
                style={{
                  width: "100%", height: 48, border: `1.5px solid ${C.borderStrong}`, borderRadius: 8,
                  background: "white", fontSize: "0.875rem", fontWeight: 600, color: C.text,
                  cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 8, fontFamily: "inherit",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 2 }}>
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>Google</span>
              </button>

              {/* Register Link */}
              <p style={{ textAlign: "center", fontSize: "0.875rem", color: C.textMuted, margin: 0 }}>
                Belum punya akun?{" "}
                <Link href="/daftar" style={{ color: C.primary, fontWeight: 700, textDecoration: "none" }}>
                  Daftar Sekarang
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
