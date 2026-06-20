"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const C = {
  primary: "#1D4ED8",
  primaryDark: "#1E40AF",
  primaryPale: "#EFF6FF",
  border: "#EAE5E0",
  borderStrong: "#D5CFC9",
  text: "#1F1B18",
  textSec: "#5C5550",
  textMuted: "#8E8680",
};

export default function LoginPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "#F0EDEA", display: "flex", flexDirection: "column" }}>

      {/* ── Navbar ── */}
      <Navbar />

      {/* ── Main Card ── */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{
          display: "flex",
          width: "100%",
          maxWidth: 900,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
        }}>

          {/* ── Left Panel ── */}
          <div style={{
            width: 420,
            flexShrink: 0,
            background: C.primaryPale,
            padding: "40px 36px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}>
            {/* Accent line */}
            <div style={{ width: 40, height: 4, background: C.primary, borderRadius: 2 }} />

            <div>
              <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: C.text, lineHeight: 1.25, margin: "0 0 6px 0" }}>
                Berdayakan Bisnis
              </h2>
              <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: C.primary, lineHeight: 1.25, margin: "0 0 16px 0" }}>
                Lokal Anda
              </h2>
              <p style={{ fontSize: "0.875rem", color: C.textSec, lineHeight: 1.6, margin: 0 }}>
                Masuk ke ekosistem digital UMKM terbesar dan mulai kelola toko Anda dengan fitur modern yang dirancang untuk pertumbuhan.
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
              <Image src="/login-artisan.png" alt="Perajin UMKM" fill style={{ objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 60%)" }} />
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div style={{
            flex: 1,
            background: "white",
            padding: "48px 40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}>
            <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: C.text, margin: "0 0 6px 0" }}>Selamat Datang Kembali</h1>
            <p style={{ fontSize: "0.875rem", color: C.textMuted, margin: "0 0 32px 0" }}>Silakan masukkan detail akun Anda untuk masuk.</p>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (email.toLowerCase().includes("admin")) {
                router.push("/admin/dashboard");
              } else if (email.toLowerCase().includes("seller")) {
                router.push("/seller/dashboard");
              } else {
                router.push("/account/profile");
              }
            }} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Email */}
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: C.text, marginBottom: 8 }}>
                  Alamat Email
                </label>
                <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${C.borderStrong}`, borderRadius: 8, overflow: "hidden", background: "white" }}>
                  <span style={{ padding: "0 14px", color: C.textMuted, display: "flex", alignItems: "center" }}>
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ flex: 1, border: "none", outline: "none", height: 46, fontSize: "0.875rem", color: C.text, fontFamily: "inherit", background: "transparent" }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label style={{ fontSize: "0.8125rem", fontWeight: 700, color: C.text }}>Kata Sandi</label>
                  <Link href="/lupa-sandi" style={{ fontSize: "0.75rem", fontWeight: 600, color: C.primary, textDecoration: "none" }}>Lupa Password?</Link>
                </div>
                <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${C.borderStrong}`, borderRadius: 8, overflow: "hidden", background: "white" }}>
                  <span style={{ padding: "0 14px", color: C.textMuted, display: "flex", alignItems: "center" }}>
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ flex: 1, border: "none", outline: "none", height: 46, fontSize: "0.875rem", color: C.text, fontFamily: "inherit", background: "transparent" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{ padding: "0 14px", background: "none", border: "none", cursor: "pointer", color: C.textMuted, display: "flex", alignItems: "center" }}
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
                  style={{ width: 16, height: 16, accentColor: C.primary, cursor: "pointer" }}
                />
                <span style={{ fontSize: "0.8125rem", color: C.textSec }}>Ingat saya untuk login berikutnya</span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                style={{
                  width: "100%", height: 50, background: C.primary, color: "white",
                  border: "none", borderRadius: 8, fontSize: "0.9rem", fontWeight: 800,
                  cursor: "pointer", letterSpacing: "0.04em", fontFamily: "inherit",
                }}
              >
                MASUK SEKARANG
              </button>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1, height: 1, background: C.border }} />
                <span style={{ fontSize: "0.75rem", color: C.textMuted, whiteSpace: "nowrap" }}>atau masuk dengan</span>
                <div style={{ flex: 1, height: 1, background: C.border }} />
              </div>

              {/* Social Logins */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { name: "Google", emoji: "🌐" },
                  { name: "Facebook", emoji: "🔵" },
                ].map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    style={{
                      height: 44, border: `1.5px solid ${C.borderStrong}`, borderRadius: 8,
                      background: "white", fontSize: "0.875rem", fontWeight: 600, color: C.text,
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      gap: 8, fontFamily: "inherit",
                    }}
                  >
                    <span>{s.emoji}</span> {s.name}
                  </button>
                ))}
              </div>

              {/* Register Link */}
              <p style={{ textAlign: "center", fontSize: "0.875rem", color: C.textMuted, margin: 0 }}>
                Belum punya akun?{" "}
                <Link href="/daftar" style={{ color: C.primary, fontWeight: 700, textDecoration: "none" }}>
                  Daftar UMKM Baru
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
