"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, User, Phone } from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { authService } from "@/backend/authService";
import { supabase } from "@/backend/supabase";
import { formatUnknownError } from "@/lib/formatError";

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

export default function RegisterPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [pendingVerifyEmail, setPendingVerifyEmail] = useState("");
  const [resending, setResending] = useState(false);

  // Setelah klik link verifikasi di email (tab baru), session tersimpan di browser
  // — tab daftar ini ikut mendeteksi dan redirect ke profil.
  useEffect(() => {
    if (!pendingVerifyEmail) return;

    const finishIfVerified = async () => {
      const profile = await authService.refreshSession();
      if (profile?.email?.toLowerCase() === pendingVerifyEmail.toLowerCase()) {
        setSuccessMsg("Email terverifikasi! Mengalihkan ke profil Anda...");
        router.replace("/account/profile");
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        void finishIfVerified();
      }
    });

    const onStorage = (e: StorageEvent) => {
      if (e.key?.includes("supabase") || e.key === "pelum-auth-verified") {
        void finishIfVerified();
      }
    };
    window.addEventListener("storage", onStorage);

    const interval = setInterval(() => void finishIfVerified(), 2500);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("storage", onStorage);
      clearInterval(interval);
    };
  }, [pendingVerifyEmail, router]);

  const generateUsername = (fullName: string): string => {
    const base = fullName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, "");
    const suffix = Math.random().toString(36).substring(2, 6);
    return `${base}${suffix}`;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Basic validations
    if (!name.trim() || name.trim().length < 2) {
      setErrorMsg("Nama lengkap minimal 2 karakter.");
      return;
    }
    if (!email.trim()) {
      setErrorMsg("Alamat email wajib diisi.");
      return;
    }
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      setErrorMsg("Nomor telepon wajib diisi (10–15 digit).");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Kata sandi minimal 8 karakter.");
      return;
    }

    setLoading(true);

    try {
      const username = generateUsername(name);
      const result = await authService.register(
        username,
        email,
        phone.trim(),
        password,
        undefined,
        name.trim()
      );

      if (result.needsEmailVerification) {
        setPendingVerifyEmail(result.email);
        setSuccessMsg(
          result.notice ||
            `Pendaftaran berhasil! Link verifikasi dikirim ke ${result.email}. Buka email lalu klik linknya (biasanya membuka tab baru — itu normal). Tab ini akan otomatis masuk setelah verifikasi.`
        );
        return;
      }

      if (result.user) {
        authService.setCurrentUser(result.user);
        setSuccessMsg("Pendaftaran berhasil! Mengalihkan ke profil Anda...");
        setTimeout(() => {
          router.push("/account/profile");
        }, 800);
        return;
      }

      setErrorMsg("Pendaftaran gagal. Silakan coba lagi.");
    } catch (err: unknown) {
      setErrorMsg(formatUnknownError(err, "Pendaftaran gagal. Silakan coba lagi."));
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

            {/* Headline */}
            <div>
              <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: C.text, lineHeight: 1.25, margin: "0 0 6px 0" }}>
                Dukung Daur Ulang
              </h2>
              <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: C.primary, lineHeight: 1.25, margin: "0 0 16px 0" }}>
                Kreatif Anda
              </h2>
              <p style={{ fontSize: "0.875rem", color: C.textSec, lineHeight: 1.6, margin: 0 }}>
                Platform digital terpadu untuk menghubungkan produk daur ulang kreatif Indonesia dengan pembeli peduli lingkungan.
              </p>
            </div>

            {/* UMKM Photo */}
            <div style={{
              position: "relative",
              width: "100%",
              borderRadius: 10,
              overflow: "hidden",
              aspectRatio: "4/3",
              marginTop: "auto",
            }}>
              <Image src="/register-umkm.png" alt="Produk Daur Ulang Kreatif" fill style={{ objectFit: "cover" }} />
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
            <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: C.text, margin: "0 0 6px 0" }}>Buat Akun Baru</h1>
            <p style={{ fontSize: "0.875rem", color: C.textMuted, margin: "0 0 24px 0" }}>Mulai langkah peduli lingkungan bersama Daurly.</p>

            {/* Error Message */}
            {errorMsg && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: "0.8125rem", color: "#DC2626", fontWeight: 600 }}>
                {errorMsg}
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div style={{ background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: "0.8125rem", color: "#16A34A", fontWeight: 600 }}>
                <p style={{ margin: 0 }}>{successMsg}</p>
                {pendingVerifyEmail && (
                  <button
                    type="button"
                    disabled={resending}
                    onClick={async () => {
                      setResending(true);
                      setErrorMsg("");
                      const result = await authService.resendVerificationEmail(pendingVerifyEmail);
                      if (result.ok) {
                        setSuccessMsg(`Link verifikasi dikirim ulang ke ${pendingVerifyEmail}. Cek inbox dan spam.`);
                      } else {
                        setErrorMsg(result.error || "Gagal mengirim ulang email verifikasi.");
                      }
                      setResending(false);
                    }}
                    style={{
                      marginTop: 10,
                      background: "none",
                      border: "none",
                      padding: 0,
                      color: C.primary,
                      fontWeight: 700,
                      cursor: resending ? "not-allowed" : "pointer",
                      fontSize: "0.8125rem",
                      textDecoration: "underline",
                    }}
                  >
                    {resending ? "Mengirim ulang..." : "Kirim ulang email verifikasi"}
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Full Name */}
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: C.text, marginBottom: 8 }}>
                  Nama Lengkap
                </label>
                <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${C.borderStrong}`, borderRadius: 8, overflow: "hidden", background: "white", height: 48 }}>
                  <span style={{ padding: "0 14px", color: C.textMuted, display: "flex", alignItems: "center" }}>
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                    style={{ flex: 1, border: "none", outline: "none", height: "100%", fontSize: "0.875rem", color: C.text, fontFamily: "inherit", background: "transparent" }}
                  />
                </div>
              </div>

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
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    style={{ flex: 1, border: "none", outline: "none", height: "100%", fontSize: "0.875rem", color: C.text, fontFamily: "inherit", background: "transparent" }}
                  />
                </div>
              </div>

              {/* Nomor Telepon */}
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: C.text, marginBottom: 8 }}>
                  Nomor Telepon
                </label>
                <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${C.borderStrong}`, borderRadius: 8, overflow: "hidden", background: "white", height: 48 }}>
                  <span style={{ padding: "0 14px", color: C.textMuted, display: "flex", alignItems: "center" }}>
                    <Phone size={16} />
                  </span>
                  <input
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    disabled={loading}
                    style={{ flex: 1, border: "none", outline: "none", height: "100%", fontSize: "0.875rem", color: C.text, fontFamily: "inherit", background: "transparent" }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: C.text, marginBottom: 8 }}>
                  Kata Sandi
                </label>
                <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${C.borderStrong}`, borderRadius: 8, overflow: "hidden", background: "white", height: 48 }}>
                  <span style={{ padding: "0 14px", color: C.textMuted, display: "flex", alignItems: "center" }}>
                    <Lock size={16} />
                  </span>
                  <input
                    className="auth-password-input"
                    type={showPass ? "text" : "password"}
                    placeholder="Minimal 8 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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
                {password.length > 0 && password.length < 8 && (
                  <p style={{ fontSize: "0.75rem", color: "#DC2626", margin: "6px 0 0 0", fontWeight: 600 }}>
                    Kata sandi minimal 8 karakter.
                  </p>
                )}
              </div>

              {/* Terms */}
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  disabled={loading}
                  style={{ width: 16, height: 16, accentColor: C.primary, cursor: "pointer", marginTop: 2, flexShrink: 0 }}
                />
                <span style={{ fontSize: "0.8125rem", color: C.textSec, lineHeight: 1.5 }}>
                  Saya menyetujui{" "}
                  <Link href="/syarat-ketentuan" style={{ color: C.primary, fontWeight: 700, textDecoration: "none" }}>Syarat &amp; Ketentuan</Link>
                  {" "}serta{" "}
                  <Link href="/kebijakan-privasi" style={{ color: C.primary, fontWeight: 700, textDecoration: "none" }}>Kebijakan Privasi</Link>
                  {" "}yang berlaku.
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={!agreed || loading}
                style={{
                  width: "100%", height: 48, background: (!agreed || loading) ? C.borderStrong : C.primary,
                  color: "white", border: "none", borderRadius: 8, fontSize: "0.875rem",
                  fontWeight: 700, cursor: (!agreed || loading) ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  fontFamily: "inherit", opacity: loading ? 0.8 : 1,
                  transition: "all 0.2s ease",
                }}
              >
                {loading ? "Mendaftarkan..." : "Daftar Sekarang →"}
              </button>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1, height: 1, background: C.border }} />
                <span style={{ fontSize: "0.75rem", color: C.textMuted, whiteSpace: "nowrap" }}>Atau daftar dengan</span>
                <div style={{ flex: 1, height: 1, background: C.border }} />
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={() => authService.loginWithGoogle()}
                disabled={loading}
                style={{
                  width: "100%", height: 48, border: `1.5px solid ${C.borderStrong}`, borderRadius: 8,
                  background: "white", fontSize: "0.875rem", fontWeight: 600, color: C.text,
                  cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 10, fontFamily: "inherit",
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

              {/* Login Link */}
              <p style={{ textAlign: "center", fontSize: "0.875rem", color: C.textMuted, margin: 0 }}>
                Sudah punya akun?{" "}
                <Link href="/masuk" style={{ color: C.text, fontWeight: 700, textDecoration: "none" }}>
                  Masuk di sini
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
