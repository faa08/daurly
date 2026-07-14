"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Trash2, Shirt, Trees, ArrowRight, Cpu } from "lucide-react";
import "./TahukahKamu.css";

interface FactCard {
  icon: React.ComponentType<any>;
  iconBg: string;
  iconColor: string;
  badge: string;
  titlePrefix?: string;
  count: number;
  titleSuffix: string;
  fact: string;
  solution: string;
  btnText: string;
  btnLink: string;
}

const FACTS_DATA: FactCard[] = [
  {
    icon: Trash2,
    iconBg: "#EFF6FF",
    iconColor: "#3B82F6",
    badge: "Limbah Plastik",
    titlePrefix: "",
    count: 450,
    titleSuffix: " Tahun Penguraian",
    fact: "Satu botol plastik sekali pakai membutuhkan waktu hingga 450 tahun untuk dapat hancur secara alami di dalam tanah.",
    solution: "Kurangi penggunaan plastik baru! Pilihlah produk upcycled plastik berkualitas hasil karya perajin kreatif lokal kami.",
    btnText: "Belanja Produk Daur Ulang",
    btnLink: "/kategori",
  },
  {
    icon: Shirt,
    iconBg: "#F5F3FF",
    iconColor: "#8B5CF6",
    badge: "Limbah Tekstil",
    titlePrefix: "",
    count: 10,
    titleSuffix: "% Emisi Karbon Dunia",
    fact: "Industri fashion menyumbang 10% emisi karbon global dan jutaan ton limbah pakaian yang mencemari perairan bumi.",
    solution: "Tampil modis tanpa merusak alam dengan busana kain perca upcycled yang memiliki cerita dan seni bernilai tinggi.",
    btnText: "Jelajahi Fashion Hijau",
    btnLink: "/kategori/fashion",
  },
  {
    icon: Trees,
    iconBg: "#ECFDF5",
    iconColor: "#10B981",
    badge: "Limbah Kertas",
    titlePrefix: "1 Ton Kertas = ",
    count: 17,
    titleSuffix: " Pohon",
    fact: "Membuat satu ton kertas konvensional menghabiskan 17 pohon dewasa, 26.500 liter air bersih, dan energi listrik yang masif.",
    solution: "Pilihlah kerajinan kertas daur ulang untuk menghemat konsumsi air bersih dan melestarikan hutan nusantara.",
    btnText: "Belanja Kriya Kertas",
    btnLink: "/kategori/kerajinan",
  },
  {
    icon: Cpu,
    iconBg: "#FEF3C7",
    iconColor: "#D97706",
    badge: "Limbah Elektronik",
    titlePrefix: "",
    count: 50,
    titleSuffix: " Jt Ton E-Waste / Thn",
    fact: "Dunia menghasilkan 50 juta ton sampah elektronik setiap tahun, namun hanya 20% yang didaur ulang dengan benar.",
    solution: "Daur ulang gadget lama Anda! Dukung perajin lokal yang memanfaatkannya menjadi karya seni industrial estetik.",
    btnText: "Belanja Karya Industrial",
    btnLink: "/kategori/kerajinan",
  },
];

function AnimatedCounter({
  target,
  duration = 1500,
  trigger = false,
}: {
  target: number;
  duration?: number;
  trigger?: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [trigger, target, duration]);

  return <>{trigger ? count : 0}</>;
}

export default function TahukahKamu() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Animate only once
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="tahukah-kamu-section">
      {/* ── Section Header ── */}
      <div style={{ textAlign: "center", marginBottom: "36px", position: "relative", zIndex: 1 }}>
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
            marginBottom: "12px",
          }}
        >
          <Sparkles size={13} />
          Edukasi Gerakan Hijau
        </span>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#1F1B18", margin: "0 0 10px 0" }}>
          Tahukah Kamu?
        </h2>
        <p style={{ fontSize: "0.875rem", color: "#8E8680", maxWidth: "560px", margin: "0 auto", lineHeight: 1.6 }}>
          Setiap keputusan kecil untuk memilih produk daur ulang berkontribusi langsung pada kelestarian bumi dan masa depan yang lebih hijau.
        </p>
      </div>

      {/* ── Fact Cards Grid ── */}
      <div className="tahukah-kamu-grid" style={{ position: "relative", zIndex: 1 }}>
        {FACTS_DATA.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`tahukah-kamu-card stagger-${idx} ${isVisible ? "visible" : ""}`}
              style={{
                background: "#FFFFFF",
                border: "1px solid #EAE5E0",
                borderRadius: "20px",
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "20px",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.01)",
              }}
            >
              {/* Card Header & Icon */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "12px",
                      background: item.iconBg,
                      color: item.iconColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      color: item.iconColor,
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {item.badge}
                  </span>
                </div>

                {/* Fact Title & Description */}
                <h3 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#1F1B18", margin: "0 0 10px 0" }}>
                  {item.titlePrefix}
                  <AnimatedCounter target={item.count} trigger={isVisible} />
                  {item.titleSuffix}
                </h3>
                <p style={{ fontSize: "0.8125rem", color: "#3E3834", lineHeight: 1.6, margin: "0 0 16px 0", fontWeight: 500 }}>
                  {item.fact}
                </p>

                {/* Solution Box */}
                <div
                  style={{
                    background: "#FAF9F6",
                    borderLeft: `3px solid ${item.iconColor}`,
                    padding: "10px 14px",
                    borderRadius: "0 8px 8px 0",
                    fontSize: "0.78rem",
                    color: "#5C5550",
                    lineHeight: 1.5,
                  }}
                >
                  <strong style={{ color: "#1F1B18", display: "block", marginBottom: "2px" }}>💡 Solusi Daurly:</strong>
                  {item.solution}
                </div>
              </div>

              {/* Action Button */}
              <Link
                href={item.btnLink}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  background: "#16A34A",
                  color: "#FFFFFF",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  padding: "10px 18px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  transition: "background 0.2s",
                  marginTop: "8px",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#15803D")}
                onMouseOut={(e) => (e.currentTarget.style.background = "#16A34A")}
              >
                {item.btnText}
                <ArrowRight size={14} />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
