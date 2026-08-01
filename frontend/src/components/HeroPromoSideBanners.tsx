"use client";

import React from "react";
import Link from "next/link";
import { Grid, Handshake, LayoutGrid, ArrowRight, BookOpen } from "lucide-react";

export default function HeroPromoSideBanners() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      {/* Banner 1: Semua Produk */}
      <Link
        href="/kategori"
        style={{
          flex: 1,
          background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
          borderRadius: "16px",
          padding: "20px 24px",
          color: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          textDecoration: "none",
          position: "relative",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
          minHeight: "184px",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 8px 20px rgba(5, 150, 105, 0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.05)";
        }}
      >
        {/* Decorative Background Icon */}
        <div style={{ position: "absolute", right: "-10px", bottom: "-10px", opacity: 0.15, color: "#FFFFFF" }}>
          <LayoutGrid size={120} />
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            <span
              style={{
                fontSize: "0.625rem",
                fontWeight: 900,
                color: "#059669",
                background: "#FFFFFF",
                padding: "2px 8px",
                borderRadius: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Katalog
            </span>
            <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>
              Semua Produk Daurly
            </span>
          </div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#FFFFFF", margin: "0 0 6px 0", lineHeight: 1.25 }}>
            Jelajahi Semua Produk
          </h3>
          <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.85)", margin: 0, maxWidth: "180px", lineHeight: 1.4 }}>
            Temukan barang ramah lingkungan terpopuler dari berbagai kategori daur ulang.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", fontWeight: 700, color: "#FFFFFF" }}>
          <span>Mulai Belanja</span>
          <ArrowRight size={13} />
        </div>
      </Link>

      {/* Banner 2: Edukasi */}
      <Link
        href="/edukasi"
        style={{
          flex: 1,
          background: "linear-gradient(135deg, #4F46E5 0%, #312E81 100%)",
          borderRadius: "16px",
          padding: "20px 24px",
          color: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          textDecoration: "none",
          position: "relative",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.05)",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
          minHeight: "184px",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 8px 20px rgba(79, 70, 229, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.05)";
        }}
      >
        {/* Decorative Background Icon */}
        <div style={{ position: "absolute", right: "-10px", bottom: "-10px", opacity: 0.1, color: "#FFFFFF" }}>
          <BookOpen size={120} />
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            <span
              style={{
                fontSize: "0.625rem",
                fontWeight: 900,
                color: "#4F46E5",
                background: "#FFFFFF",
                padding: "2px 8px",
                borderRadius: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              EDUKASI
            </span>
            <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>
              Pusat Informasi
            </span>
          </div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#FFFFFF", margin: "0 0 6px 0", lineHeight: 1.25 }}>
            Pusat Edukasi Lingkungan
          </h3>
          <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.85)", margin: 0, maxWidth: "180px", lineHeight: 1.4 }}>
            Pelajari cara memilah sampah, membuat kompos, dan mendukung ekonomi sirkular.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", fontWeight: 700, color: "#FFFFFF" }}>
          <span>Mulai Belajar</span>
          <ArrowRight size={13} />
        </div>
      </Link>
    </div>
  );
}
