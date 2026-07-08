"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/backend/supabase";
import { authService } from "@/backend/authService";

const C = {
  primary: "#16A34A",
  border: "#EAE5E0",
  text: "#1F1B18",
  textMuted: "#8E8680",
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setReady(true);
      }
    });

    async function init() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code) {
        try {
          await supabase.auth.exchangeCodeForSession(code);
        } catch (err) {
          console.error("Gagal melakukan pertukaran kode sesi:", err);
        }
      }
      
      const {
        data: { session },
      } = await supabase.auth.getSession();
      
      if (session) {
        setReady(true);
      } else {
        setErrorMsg("Link reset tidak valid atau sudah kadaluarsa. Minta link baru dari halaman lupa sandi.");
      }
    }
    
    init();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (password.length < 6) {
      setErrorMsg("Kata sandi minimal 6 karakter.");
      return;
    }
    if (password !== confirm) {
      setErrorMsg("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setLoading(true);
    const ok = await authService.updatePassword(password);
    setLoading(false);

    if (ok) {
      setSuccess(true);
      await authService.refreshSession();
      setTimeout(() => router.push("/account/profile"), 1500);
    } else {
      setErrorMsg("Gagal memperbarui kata sandi. Coba lagi atau minta link baru.");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F0EDEA", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            background: "#fff",
            borderRadius: 16,
            padding: 32,
            boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: C.text, marginBottom: 8 }}>Reset Kata Sandi</h1>
          <p style={{ fontSize: "0.875rem", color: C.textMuted, marginBottom: 24 }}>
            Buat kata sandi baru untuk akun Daurly Anda.
          </p>

          {success ? (
            <p style={{ color: "#15803d", fontWeight: 600, fontSize: "0.875rem" }}>
              Kata sandi berhasil diperbarui. Mengalihkan...
            </p>
          ) : !ready ? (
            <p style={{ color: "#b45309", fontSize: "0.875rem" }}>{errorMsg || "Memuat..."}</p>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {errorMsg && (
                <p style={{ color: "#dc2626", fontSize: "0.8rem", fontWeight: 600 }}>{errorMsg}</p>
              )}
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: C.textMuted }}>Kata sandi baru</label>
                <div style={{ position: "relative", marginTop: 6 }}>
                  <Lock size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.textMuted }} />
                  <input
                    className="auth-password-input"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ width: "100%", padding: "12px 40px", borderRadius: 8, border: `1px solid ${C.border}` }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: C.textMuted }}>Konfirmasi kata sandi</label>
                <input
                  className="auth-password-input"
                  type={showPass ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  style={{ width: "100%", marginTop: 6, padding: 12, borderRadius: 8, border: `1px solid ${C.border}` }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "12px 16px",
                  background: C.primary,
                  color: "#fff",
                  fontWeight: 700,
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Menyimpan..." : "Simpan Kata Sandi"}
              </button>
            </form>
          )}

          <p style={{ marginTop: 20, fontSize: "0.8rem", textAlign: "center" }}>
            <Link href="/masuk" style={{ color: C.primary, fontWeight: 700 }}>
              ← Kembali ke login
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
