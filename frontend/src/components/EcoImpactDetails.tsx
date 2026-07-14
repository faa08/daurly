"use client";

import React from "react";
import { Leaf, Recycle, Trash2, ShieldCheck, Sparkles } from "lucide-react";

interface EcoImpactDetailsProps {
  bahan?: string;
  berat?: number;
}

interface Material {
  name: string;
  percentage: number;
}

function parseMaterials(bahan?: string): Material[] {
  if (!bahan) return [];
  try {
    const parts = bahan.split(",");
    const list: Material[] = [];
    for (const part of parts) {
      const clean = part.trim();
      const match = clean.match(/(\d+)\s*%/);
      if (match) {
        const percentage = parseInt(match[1], 10);
        const name = clean
          .replace(/(\d+)\s*%/, "")
          .replace(/[:\-]/g, "")
          .trim();
        list.push({ name: name || "Bahan Daur Ulang", percentage });
      }
    }
    // Sort from highest percentage
    return list.sort((a, b) => b.percentage - a.percentage);
  } catch (e) {
    console.error("Gagal memilah data bahan:", e);
    return [];
  }
}

export default function EcoImpactDetails({ bahan, berat }: EcoImpactDetailsProps) {
  const materials = parseMaterials(bahan);
  const itemWeight = Number(berat) || 350; // default 350g if 0/null

  // Heuristik Dampak
  const co2SavedGrams = itemWeight * 1.5;
  const co2SavedKg = co2SavedGrams / 1000;
  const plasticBottlesSaved = Math.max(1, Math.round(itemWeight / 25)); // Asumsi 1 botol PET = 25g
  const wasteSavedKg = itemWeight / 1000;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ── Komposisi Bahan Daur Ulang ── */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #EAE5E0",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "#E8F5E9",
              color: "#16A34A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Recycle size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: "0.875rem", fontWeight: 800, color: "#1F1B18", margin: 0 }}>
              Material Breakdown
            </h3>
            <p style={{ fontSize: "0.6875rem", color: "#8E8680", margin: 0 }}>
              Komposisi serat & bahan daur ulang terverifikasi
            </p>
          </div>
        </div>

        {materials.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {materials.map((m) => (
              <div key={m.name} style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#3E3834",
                    marginBottom: 4,
                  }}
                >
                  <span>{m.name}</span>
                  <span style={{ color: "#16A34A" }}>{m.percentage}%</span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: 8,
                    background: "#F5F3F0",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${m.percentage}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #10B981, #059669)",
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#15803D",
                background: "#E8F5E9",
                border: "1px solid #C8E6C9",
                padding: "6px 12px",
                borderRadius: 8,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <ShieldCheck size={14} />
              {bahan || "Bahan Ramah Lingkungan"}
            </span>
          </div>
        )}
      </div>

      {/* ── Eco Impact Tracker ── */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #EAE5E0",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "#E8F5E9",
              color: "#16A34A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: "0.875rem", fontWeight: 800, color: "#1F1B18", margin: 0 }}>
              Eco Impact Tracker
            </h3>
            <p style={{ fontSize: "0.6875rem", color: "#8E8680", margin: 0 }}>
              Estimasi pencegahan dampak buruk lingkungan
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {/* Card CO2 */}
          <div
            style={{
              background: "#F4FDF7",
              border: "1px solid #DCFCE7",
              borderRadius: 10,
              padding: "14px 12px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#16A34A" }}>
              <Leaf size={14} />
              <span style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.02em" }}>
                CO2 Dicegah
              </span>
            </div>
            <span style={{ fontSize: "1.125rem", fontWeight: 900, color: "#14532D" }}>
              {co2SavedKg >= 1 ? `${co2SavedKg.toFixed(2)} kg` : `${co2SavedGrams} g`}
            </span>
            <span style={{ fontSize: "0.625rem", color: "#15803D/80", lineHeight: 1.2 }}>
              Setara emisi mobil sejauh {(co2SavedKg * 4).toFixed(1)} km
            </span>
          </div>

          {/* Card Sampah */}
          <div
            style={{
              background: "#F4FDF7",
              border: "1px solid #DCFCE7",
              borderRadius: 10,
              padding: "14px 12px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#16A34A" }}>
              <Trash2 size={14} />
              <span style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.02em" }}>
                Sampah Dialihkan
              </span>
            </div>
            <span style={{ fontSize: "1.125rem", fontWeight: 900, color: "#14532D" }}>
              {wasteSavedKg >= 1 ? `${wasteSavedKg.toFixed(2)} kg` : `${itemWeight} g`}
            </span>
            <span style={{ fontSize: "0.625rem", color: "#15803D/80", lineHeight: 1.2 }}>
              Menyelamatkan ±{plasticBottlesSaved} botol plastik PET
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
