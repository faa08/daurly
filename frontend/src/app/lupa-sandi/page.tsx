"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, CheckCircle, ArrowLeft } from "lucide-react";
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

export default function LupaSandiPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1200);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F0EDEA", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ display: "flex", width: "100%", maxWidth: 860, borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.10)" }}>

          {/* Left Panel */}
          <div style={{ width: 380, flexShrink: 0, background: `linear-gradient(160deg, ${C.primary} 0%, ${C.primaryDark} 100%)`, padding: "48px 36px", display: "flex", flexDirection: "column", gap: 24, color: "white" }}>
            <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.5)", borderRadius: 2 }} />
            <div>
              <h2 style={{ fontSize: "1.75rem", fontWeight: 800, lineHeight: 1.25, margin: "0 0 12px 0" }}>Lupa Kata Sandi?</h2>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.65, opacity: 0.85, margin: 0 }}>Masukkan email terdaftar dan kami kirimkan tautan untuk mereset kata sandi kamu.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 8 }}>
              {[
                { num: "1", text: "Masukkan alamat email akun kamu" },
                { num: "2", text: "Cek inbox (dan folder spam) email kamu" },
                { num: "3", text: "Klik tautan reset dan buat sandi baru" },
              ].map((step) => (
                <div key={step.num} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800, flexShrink: 0 }}>{step.num}</div>
                  <p style={{ fontSize: "0.85rem", opacity: 0.9, margin: 0, lineHeight: 1.5, paddingTop: 4 }}>{step.text}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "auto", padding: "20px", background: "rgba(255,255,255,0.12)", borderRadius: 10 }}>
              <p style={{ fontSize: "0.8rem", opacity: 0.8, margin: 0, lineHeight: 1.6 }}>🔒 Tautan reset berlaku selama <strong>30 menit</strong> dan hanya bisa dipakai sekali.</p>
            </div>
          </div>

          {/* Right Panel */}
          <div style={{ flex: 1, background: "white", padding: "52px 44px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {!submitted ? (
              <>
                <div style={{ marginBottom: 32 }}>
                  <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: C.text, margin: "0 0 8px 0" }}>Reset Kata Sandi</h1>
                  <p style={{ fontSize: "0.875rem", color: C.textMuted, margin: 0 }}>Kami akan mengirimkan link reset ke email kamu.</p>
                </div>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: C.text, marginBottom: 8 }}>Alamat Email</label>
                    <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${C.borderStrong}`, borderRadius: 8, overflow: "hidden", background: "white" }}>
                      <span style={{ padding: "0 14px", color: C.textMuted, display: "flex", alignItems: "center" }}><Mail size={16} /></span>
                      <input type="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ flex: 1, border: "none", outline: "none", height: 46, fontSize: "0.875rem", color: C.text, fontFamily: "inherit", background: "transparent" }} />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} style={{ width: "100%", height: 50, background: loading ? C.primaryDark : C.primary, color: "white", border: "none", borderRadius: 8, fontSize: "0.9rem", fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.04em", fontFamily: "inherit" }}>
                    {loading ? "Mengirim..." : "KIRIM LINK RESET"}
                  </button>
                  <Link href="/masuk" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: "0.875rem", color: C.textSec, fontWeight: 600, textDecoration: "none", paddingTop: 4 }}>
                    <ArrowLeft size={15} /> Kembali ke halaman masuk
                  </Link>
                </form>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 20 }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CheckCircle size={36} color="#16A34A" strokeWidth={1.8} />
                </div>
                <div>
                  <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: C.text, margin: "0 0 10px 0" }}>Cek Email Kamu!</h2>
                  <p style={{ fontSize: "0.9rem", color: C.textSec, lineHeight: 1.65, margin: 0, maxWidth: 320 }}>
                    Kami telah mengirimkan link reset ke <strong style={{ color: C.text }}>{email}</strong>. Cek inbox atau folder spam kamu.
                  </p>
                </div>
                <div style={{ width: "100%", background: "#F0FDF4", border: "1.5px solid #BBF7D0", borderRadius: 10, padding: "16px 20px" }}>
                  <p style={{ fontSize: "0.8rem", color: "#166534", margin: 0, lineHeight: 1.6 }}>
                    ✅ Link berlaku 30 menit.{" "}
                    <button onClick={() => { setSubmitted(false); setEmail(""); }} style={{ background: "none", border: "none", color: "#16A34A", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: "0.8rem", padding: 0 }}>Kirim ulang</button>.
                  </p>
                </div>
                <Link href="/masuk" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.875rem", color: C.primary, fontWeight: 700, textDecoration: "none" }}>
                  <ArrowLeft size={15} /> Kembali ke halaman masuk
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
