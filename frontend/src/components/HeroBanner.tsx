"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    image: "/hero-banner.png",
    badge: "PROMO SPESIAL",
    title1: "Karya Terbaik",
    title2: "Dari Seluruh Indonesia",
    subtitle: "Dapatkan diskon spesial untuk produk-produk kerajinan tangan otentik pilihan.",
    btnText: "Lihat Promo",
    link: "/promo",
  },
  {
    image: "/hero-banner-2.png",
    badge: "FASHION LOKAL",
    title1: "Keindahan Batik",
    title2: "& Tenun Nusantara",
    subtitle: "Tampil elegan dengan koleksi busana tradisional modern hasil karya desainer lokal.",
    btnText: "Jelajahi Koleksi",
    link: "/kategori/fashion",
  },
  {
    image: "/hero-banner-3.png",
    badge: "KULINER NUSANTARA",
    title1: "Cita Rasa Kopi",
    title2: "& Kuliner Asli",
    subtitle: "Rasakan kenikmatan kopi arabika premium dan camilan tradisional langsung dari petani.",
    btnText: "Belanja Sekarang",
    link: "/kategori/kuliner",
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isHovered, nextSlide]);

  return (
    <section className="hero-section-container">
      <div className="container">
        <div 
          className="hero-banner-inner"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ position: "relative", height: "380px" }}
        >
          {/* Slides */}
          {slides.map((slide, idx) => {
            const isActive = idx === current;
            return (
              <div 
                key={idx} 
                className={`hero-slide ${isActive ? "active" : ""}`}
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: isActive ? 1 : 0,
                  transition: "opacity 0.8s ease-in-out",
                  zIndex: isActive ? 2 : 1,
                  pointerEvents: isActive ? "auto" : "none",
                }}
              >
                <Image
                  src={slide.image}
                  alt={slide.badge}
                  fill
                  priority={idx === 0}
                  className="hero-img-custom"
                  style={{ objectFit: "cover" }}
                />
                <div className="hero-overlay-custom" />

                <div 
                  className="hero-content-custom"
                  style={{
                    transform: isActive ? "translateY(0)" : "translateY(20px)",
                    opacity: isActive ? 1 : 0,
                    transition: "transform 0.6s ease-out 0.2s, opacity 0.6s ease-out 0.2s",
                    padding: "44px 50px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "12px",
                  }}
                >
                  <span className="hero-badge-custom">{slide.badge}</span>
                  <h1 className="hero-title-custom" style={{ margin: 0 }}>
                    {slide.title1}<br />{slide.title2}
                  </h1>
                  {slide.subtitle && (
                    <p className="hero-desc-custom" style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "0.875rem", maxWidth: "480px", margin: "4px 0 8px 0", lineHeight: "1.5" }}>
                      {slide.subtitle}
                    </p>
                  )}
                  <Link href={slide.link} className="hero-btn-custom">
                    {slide.btnText}
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Navigation Arrows */}
          <button 
            onClick={prevSlide} 
            className="hero-nav-arrow prev"
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={nextSlide} 
            className="hero-nav-arrow next"
            aria-label="Next slide"
          >
            <ChevronRight size={20} />
          </button>

          {/* Indicators / Dots */}
          <div className="hero-dots-container">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`hero-dot ${idx === current ? "active" : ""}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
