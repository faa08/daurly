"use client";

import React, { useState } from "react";
import { Leaf, Info, Star, Compass, Trash2, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

interface RegionData {
  name: string;
  trashVolume: string;
  recycleRate: string;
  storeCount: number;
  highlight: string;
  desc: string;
}

const DATA_REGIONS: Record<string, RegionData> = {
  nasional: {
    name: "Indonesia (Nasional)",
    trashVolume: "64 Juta Ton / tahun",
    recycleRate: "10%",
    storeCount: 42,
    highlight: "Penyumbang sampah plastik laut terbesar ke-2 di dunia jika tidak ditangani.",
    desc: "Indonesia darurat sampah plastik. Daurly bermitra dengan pengrajin lokal dari Sabang sampai Merauke untuk mendaur ulang material plastik, kayu, tekstil, dan kertas bekas menjadi barang bernilai ekonomi.",
  },
  sumatra: {
    name: "Sumatra",
    trashVolume: "12,200 Ton / hari",
    recycleRate: "8.5%",
    storeCount: 8,
    highlight: "Potensi limbah sabut kelapa & pelepah kelapa sawit melimpah.",
    desc: "Komunitas daur ulang di Sumatra aktif memproses limbah pertanian dan perkebunan menjadi produk anyaman, tali sabut kelapa, dan pupuk kompos organik premium.",
  },
  jawa: {
    name: "Jawa",
    trashVolume: "38,500 Ton / hari",
    recycleRate: "12.4%",
    storeCount: 22,
    highlight: "Konsentrasi industri kreatif daur ulang plastik PET & tekstil terbesar.",
    desc: "Sebagai pusat populasi, Jawa memproduksi sampah terbesar. Melalui Daurly, puluhan mitra mengolah botol plastik bekas menjadi totebag kain daur ulang, furniture kayu palet, dan kerajinan tangan kelas ekspor.",
  },
  kalimantan: {
    name: "Kalimantan",
    trashVolume: "4,800 Ton / hari",
    recycleRate: "6.2%",
    storeCount: 4,
    highlight: "Upcycling limbah kayu sisa tebangan industri kehutanan.",
    desc: "Perajin di Kalimantan memanfaatkan limbah kayu ulin dan serutan kayu kelapa menjadi perabot estetik, jam tangan kayu bekas, dan hiasan rumah bernuansa alam.",
  },
  sulawesi: {
    name: "Sulawesi",
    trashVolume: "5,100 Ton / hari",
    recycleRate: "7.1%",
    storeCount: 3,
    highlight: "Daur ulang sampah pesisir dan cangkang laut.",
    desc: "Dengan garis pantai yang panjang, Sulawesi fokus pada upcycling sampah laut, cangkang kerang, dan sabut kelapa menjadi kerajinan hiasan dinding, souvenir wisata, dan aksesoris ramah lingkungan.",
  },
  baliNusa: {
    name: "Bali & Nusa Tenggara",
    trashVolume: "3,800 Ton / hari",
    recycleRate: "15.0%",
    storeCount: 4,
    highlight: "Tingkat daur ulang tertinggi berkat kepedulian pariwisata hijau.",
    desc: "Bali memimpin kampanye bebas plastik sekali pakai. Banyak botol kaca bekas hotel diubah menjadi gelas estetik tiup, tas anyaman jaring plastik daur ulang, serta perhiasan perak daur ulang.",
  },
  papua: {
    name: "Papua",
    trashVolume: "1,900 Ton / hari",
    recycleRate: "4.8%",
    storeCount: 1,
    highlight: "Penggunaan serat alam lokal terverifikasi.",
    desc: "Komunitas adat di Papua berkolaborasi membuat noken ramah lingkungan dari serat kulit kayu sisa yang dikumpulkan tanpa menebang pohon secara merusak.",
  },
};

export default function IndonesiaWasteMap() {
  const [selectedKey, setSelectedKey] = useState<string>("nasional");
  const currentData = DATA_REGIONS[selectedKey];

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #EAE5E0",
        borderRadius: 24,
        padding: "32px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.02)",
        marginTop: 16,
        marginBottom: 24,
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 32 }}>
        {/* ── Kiri: Peta Indonesia Interaktif ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 800,
                color: "#16A34A",
                background: "#E8F5E9",
                padding: "6px 14px",
                borderRadius: 99,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Compass size={13} />
              Peta Gerakan Hijau Indonesia
            </span>
            <h2 style={{ fontSize: "1.375rem", fontWeight: 900, color: "#1F1B18", margin: "10px 0 6px 0" }}>
              Sentuh Wilayah Untuk Data Sampah
            </h2>
            <p style={{ fontSize: "0.8125rem", color: "#8E8680", margin: 0 }}>
              Klik pada pulau di bawah untuk melihat statistik volume sampah dan toko daur ulang lokal.
            </p>
          </div>

          {/* SVG Map Container */}
          <div
            style={{
              position: "relative",
              background: "#F9F8F6",
              borderRadius: 16,
              border: "1px dashed #E2DDD5",
              padding: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 280,
            }}
          >
            <svg
              viewBox="0 0 760 300"
              style={{ width: "100%", height: "auto", maxHeight: 300 }}
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Sabang / Sumatra Island */}
              <path
                d="M 50,110 L 150,200 L 170,210 L 190,230 L 160,240 L 40,130 Z"
                fill={selectedKey === "sumatra" ? "#16A34A" : "#C8E6C9"}
                stroke="#FFFFFF"
                strokeWidth="2"
                style={{ cursor: "pointer", transition: "all 0.3s ease" }}
                onClick={() => setSelectedKey("sumatra")}
              />
              <text x="70" y="180" fill={selectedKey === "sumatra" ? "#FFFFFF" : "#1B5E20"} fontSize="11" fontWeight="800" pointerEvents="none">
                SUMATRA
              </text>

              {/* Jawa Island */}
              <path
                d="M 200,240 L 360,250 L 360,258 L 200,248 Z"
                fill={selectedKey === "jawa" ? "#16A34A" : "#C8E6C9"}
                stroke="#FFFFFF"
                strokeWidth="2"
                style={{ cursor: "pointer", transition: "all 0.3s ease" }}
                onClick={() => setSelectedKey("jawa")}
              />
              <text x="270" y="270" fill={selectedKey === "jawa" ? "#16A34A" : "#1B5E20"} fontSize="11" fontWeight="800" pointerEvents="none">
                JAWA
              </text>

              {/* Kalimantan Island */}
              <path
                d="M 220,110 L 290,100 L 310,130 L 300,180 L 240,190 Z"
                fill={selectedKey === "kalimantan" ? "#16A34A" : "#C8E6C9"}
                stroke="#FFFFFF"
                strokeWidth="2"
                style={{ cursor: "pointer", transition: "all 0.3s ease" }}
                onClick={() => setSelectedKey("kalimantan")}
              />
              <text x="235" y="145" fill={selectedKey === "kalimantan" ? "#FFFFFF" : "#1B5E20"} fontSize="11" fontWeight="800" pointerEvents="none">
                KALIMANTAN
              </text>

              {/* Sulawesi Island */}
              <path
                d="M 340,130 L 370,120 L 370,140 L 350,150 L 370,170 L 390,150 L 400,175 L 380,195 L 355,180 L 340,150 Z"
                fill={selectedKey === "sulawesi" ? "#16A34A" : "#C8E6C9"}
                stroke="#FFFFFF"
                strokeWidth="2"
                style={{ cursor: "pointer", transition: "all 0.3s ease" }}
                onClick={() => setSelectedKey("sulawesi")}
              />
              <text x="375" y="135" fill={selectedKey === "sulawesi" ? "#16A34A" : "#1B5E20"} fontSize="11" fontWeight="800" pointerEvents="none">
                SULAWESI
              </text>

              {/* Bali & Nusa Tenggara */}
              <path
                d="M 370,253 L 480,260 L 480,265 L 370,258 Z"
                fill={selectedKey === "baliNusa" ? "#16A34A" : "#C8E6C9"}
                stroke="#FFFFFF"
                strokeWidth="2"
                style={{ cursor: "pointer", transition: "all 0.3s ease" }}
                onClick={() => setSelectedKey("baliNusa")}
              />
              <text x="410" y="243" fill={selectedKey === "baliNusa" ? "#16A34A" : "#1B5E20"} fontSize="10" fontWeight="800" pointerEvents="none">
                BALI & NUSA TENGGARA
              </text>

              {/* Papua */}
              <path
                d="M 560,140 L 660,165 L 670,190 L 650,210 L 580,205 Z"
                fill={selectedKey === "papua" ? "#16A34A" : "#C8E6C9"}
                stroke="#FFFFFF"
                strokeWidth="2"
                style={{ cursor: "pointer", transition: "all 0.3s ease" }}
                onClick={() => setSelectedKey("papua")}
              />
              <text x="595" y="180" fill={selectedKey === "papua" ? "#FFFFFF" : "#1B5E20"} fontSize="11" fontWeight="800" pointerEvents="none">
                PAPUA
              </text>

              {/* Reset to Nasional Button inside Map */}
              {selectedKey !== "nasional" && (
                <g style={{ cursor: "pointer" }} onClick={() => setSelectedKey("nasional")}>
                  <rect x="20" y="20" width="130" height="30" rx="6" fill="#F0F9F4" stroke="#BBF7D0" strokeWidth="1" />
                  <text x="32" y="38" fill="#15803D" fontSize="11" fontWeight="700">
                    ↺ Reset ke Nasional
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* ── Kanan: Panel Fakta & Data Sampah ── */}
        <div
          style={{
            background: "#FCFCFA",
            border: "1px solid #EAE5E0",
            borderRadius: 16,
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#16A34A", marginBottom: 12 }}>
              <Leaf size={18} />
              <span style={{ fontSize: "0.875rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.03em" }}>
                {currentData.name}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {/* Box Volume */}
              <div style={{ background: "#FFFFFF", border: "1px solid #EAE5E0", borderRadius: 10, padding: 12 }}>
                <span style={{ fontSize: "0.625rem", color: "#8E8680", display: "block", fontWeight: 700, textTransform: "uppercase" }}>
                  Volume Sampah
                </span>
                <span style={{ fontSize: "1.125rem", fontWeight: 900, color: "#1F1B18" }}>
                  {currentData.trashVolume}
                </span>
              </div>
              {/* Box Daur Ulang */}
              <div style={{ background: "#FFFFFF", border: "1px solid #EAE5E0", borderRadius: 10, padding: 12 }}>
                <span style={{ fontSize: "0.625rem", color: "#8E8680", display: "block", fontWeight: 700, textTransform: "uppercase" }}>
                  Daur Ulang
                </span>
                <span style={{ fontSize: "1.125rem", fontWeight: 900, color: "#16A34A" }}>
                  {currentData.recycleRate}
                </span>
              </div>
            </div>

            {/* Sorotan/Highlight */}
            <div
              style={{
                background: "#F4FDF7",
                border: "1px solid #DCFCE7",
                borderRadius: 10,
                padding: "12px 14px",
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
                marginBottom: 16,
              }}
            >
              <Info size={14} style={{ color: "#16A34A", flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: "0.75rem", color: "#15803D", margin: 0, fontWeight: 600, lineHeight: 1.4 }}>
                {currentData.highlight}
              </p>
            </div>

            {/* Deskripsi */}
            <p style={{ fontSize: "0.78rem", color: "#5C5550", lineHeight: 1.6, margin: 0 }}>
              {currentData.desc}
            </p>
          </div>

          {/* Toko Daur Ulang & Tombol Belanja */}
          <div style={{ borderTop: "1px solid #EAE5E0", paddingTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "#8E8680", fontWeight: 600 }}>Toko Daur Ulang Terdaftar</span>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  color: "#15803D",
                  background: "#E8F5E9",
                  padding: "2px 8px",
                  borderRadius: 4,
                }}
              >
                {currentData.storeCount} Toko / Mitra
              </span>
            </div>
            <a
              href="/kategori"
              style={{
                display: "block",
                textAlign: "center",
                background: "#16A34A",
                color: "#FFFFFF",
                fontSize: "0.8125rem",
                fontWeight: 700,
                padding: "12px 20px",
                borderRadius: 8,
                textDecoration: "none",
                transition: "background 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#15803D")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#16A34A")}
            >
              Belanja Produk Daur Ulang Kreatif
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
