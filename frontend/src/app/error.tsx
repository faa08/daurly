"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="id">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#FCFCFA" }}>
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              maxWidth: 420,
              width: "100%",
              background: "white",
              border: "1px solid #EAE5E0",
              borderRadius: 16,
              padding: 32,
              textAlign: "center",
            }}
          >
            <h1 style={{ fontSize: "1.25rem", fontWeight: 800, margin: "0 0 8px" }}>
              Terjadi Kesalahan
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#5C5550", marginBottom: 24 }}>
              Maaf, ada masalah saat memuat halaman. Silakan coba lagi.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                type="button"
                onClick={() => reset()}
                style={{
                  height: 44,
                  background: "#16A34A",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Coba Lagi
              </button>
              <Link href="/" style={{ fontSize: "0.8125rem", color: "#16A34A", fontWeight: 700 }}>
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
