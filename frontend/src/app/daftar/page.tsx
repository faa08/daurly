"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, User, Users, Grid } from "lucide-react";

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

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

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
            background: "white",
            padding: "36px 32px 0",
            display: "flex",
            flexDirection: "column",
            gap: 18,
            overflow: "hidden",
          }}>
            {/* Badge */}
            <span style={{
              display: "inline-block", background: C.primary, color: "white",
              fontSize: "0.65rem", fontWeight: 800, padding: "5px 12px", borderRadius: 4,
              letterSpacing: "0.06em", width: "fit-content",
            }}>BERGABUNG SEKARANG</span>

            {/* Headline */}
            <div>
              <h2 style={{ fontSize: "1.875rem", fontWeight: 800, color: C.text, lineHeight: 1.15, margin: "0 0 14px 0" }}>
                Berdayakan Bisnis Lokal Anda.
              </h2>
              <p style={{ fontSize: "0.875rem", color: C.textSec, lineHeight: 1.6, margin: 0 }}>
                Platform digital terpadu untuk menghubungkan produk unggulan UMKM Indonesia dengan pembeli di seluruh nusantara.
              </p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { icon: <Users size={20} color={C.textSec} />, value: "15k+", label: "Pelaku UMKM" },
                { icon: <Grid size={20} color={C.textSec} />, value: "500+", label: "Kategori Produk" },
              ].map((s, i) => (
                <div key={i} style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
                  {s.icon}
                  <p style={{ fontSize: "1.25rem", fontWeight: 800, color: C.text, margin: 0 }}>{s.value}</p>
                  <p style={{ fontSize: "0.75rem", color: C.textMuted, margin: 0 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* UMKM Photo — fills the bottom, no bottom padding */}
            <div style={{ position: "relative", width: "calc(100% + 64px)", marginLeft: -32, marginTop: "auto", height: 200 }}>
              <Image src="/register-umkm.png" alt="Produk UMKM Indonesia" fill style={{ objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0.15) 100%)" }} />
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div style={{
            flex: 1,
            background: "white",
            borderLeft: `1px solid ${C.border}`,
            padding: "48px 40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}>
            <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: C.text, margin: "0 0 6px 0" }}>Buat Akun Baru</h1>
            <p style={{ fontSize: "0.875rem", color: C.textMuted, margin: "0 0 28px 0" }}>Mulai langkah suksesmu di Pelataran UMKM.</p>

            <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Full Name */}
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: C.text, marginBottom: 8 }}>
                  Nama Lengkap
                </label>
                <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${C.borderStrong}`, borderRadius: 8, background: "white" }}>
                  <span style={{ padding: "0 14px", color: C.textMuted, display: "flex", alignItems: "center" }}>
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ flex: 1, border: "none", outline: "none", height: 46, fontSize: "0.875rem", color: C.text, fontFamily: "inherit", background: "transparent" }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: C.text, marginBottom: 8 }}>
                  Alamat Email
                </label>
                <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${C.borderStrong}`, borderRadius: 8, background: "white" }}>
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
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: C.text, marginBottom: 8 }}>
                  Kata Sandi
                </label>
                <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${C.borderStrong}`, borderRadius: 8, background: "white" }}>
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

              {/* Terms */}
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: C.primary, cursor: "pointer", marginTop: 2, flexShrink: 0 }}
                />
                <span style={{ fontSize: "0.8125rem", color: C.textSec, lineHeight: 1.5 }}>
                  Saya menyetujui{" "}
                  <Link href="#" style={{ color: C.primary, fontWeight: 700, textDecoration: "none" }}>Syarat &amp; Ketentuan</Link>
                  {" "}serta{" "}
                  <Link href="#" style={{ color: C.primary, fontWeight: 700, textDecoration: "none" }}>Kebijakan Privasi</Link>
                  {" "}yang berlaku.
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={!agreed}
                style={{
                  width: "100%", height: 50, background: agreed ? C.primary : C.borderStrong,
                  color: "white", border: "none", borderRadius: 8, fontSize: "0.9375rem",
                  fontWeight: 700, cursor: agreed ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  fontFamily: "inherit",
                }}
              >
                Daftar Sekarang →
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
                style={{
                  width: "100%", height: 46, border: `1.5px solid ${C.borderStrong}`, borderRadius: 8,
                  background: "white", fontSize: "0.875rem", fontWeight: 600, color: C.text,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 10, fontFamily: "inherit",
                }}
              >
                <span style={{ fontSize: "1rem" }}>🌐</span> Google
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
