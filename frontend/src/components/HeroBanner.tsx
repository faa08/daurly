"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  fetchHomeHeroSlides,
  type SiteBanner,
} from "@/backend/bannerService";

import { supabase } from "@/backend/supabase";

export default function HeroBanner() {
  const [slides, setSlides] = useState<SiteBanner[]>([]);
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    async function loadData() {
      const dbSlides = await fetchHomeHeroSlides();
      
      try {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        
        // Cek apakah pakai placeholder (tidak ada url supabase)
        const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");
        
        if (!isPlaceholder) {
          const { data: newsData, error } = await supabase
            .from("berita")
            .select("*")
            .gte("created_at", yesterday)
            .order("created_at", { ascending: false })
            .limit(1);
            
          if (!error && newsData && newsData.length > 0) {
            const news = newsData[0];
            const newsSlide: SiteBanner = {
              id_banner: `news-${news.id}`,
              banner_kind: "home_hero",
              category_slug: "",
              badge: "BERITA TERBARU",
              title_line1: news.judul,
              title_line2: null,
              description: news.ringkasan || "Simak berita terbaru kami di portal berita DaurlY.",
              button_text: "Baca Selengkapnya",
              button_link: `/news/${news.id}`,
              image_url: (news.image_urls && news.image_urls.length > 0) ? news.image_urls[0] : "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=1200&auto=format&fit=crop",
              image_position: "center",
              sort_order: 1,
              is_active: true
            };
            
            // Insert into second position (index 1) if possible
            if (dbSlides.length >= 1) {
              dbSlides.splice(1, 0, newsSlide);
            } else {
              dbSlides.push(newsSlide);
            }
          }
        }
      } catch (err) {
        console.error("Gagal memuat berita terbaru untuk banner:", err);
      }
      
      setSlides(dbSlides);
    }
    
    loadData();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (slides.length <= 1 ? 0 : prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = () => {
    setCurrent((prev) => (slides.length <= 1 ? 0 : prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (isHovered || slides.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isHovered, nextSlide, slides.length]);

  useEffect(() => {
    if (current >= slides.length && slides.length > 0) setCurrent(0);
  }, [current, slides.length]);

  if (!slides.length) {
    return (
      <div
        className="hero-banner-inner"
        style={{ position: "relative", height: "380px", background: "#EAE5E0" }}
      />
    );
  }

  return (
    <div
      className="hero-banner-inner"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ position: "relative", height: "380px" }}
    >
          {slides.map((slide, idx) => {
            const isActive = idx === current;
            const imgSrc = slide.image_url || "/hero-banner.png";
            const isExternal = imgSrc.startsWith("http");

            return (
              <div
                key={slide.id_banner}
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
                {isExternal ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imgSrc}
                    alt={slide.badge || "Banner"}
                    className="hero-img-custom"
                    style={{ objectFit: "cover", width: "100%", height: "100%", position: "absolute", inset: 0 }}
                  />
                ) : (
                  <Image
                    src={imgSrc}
                    alt={slide.badge || "Banner"}
                    fill
                    priority={idx === 0}
                    className="hero-img-custom"
                    style={{ objectFit: "cover" }}
                  />
                )}
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
                  {slide.badge && <span className="hero-badge-custom">{slide.badge}</span>}
                  <h1 className="hero-title-custom" style={{ margin: 0 }}>
                    {slide.title_line1}
                    {slide.title_line2 ? (
                      <>
                        <br />
                        {slide.title_line2}
                      </>
                    ) : null}
                  </h1>
                  {slide.description && (
                    <p
                      className="hero-desc-custom"
                      style={{
                        color: "rgba(255, 255, 255, 0.9)",
                        fontSize: "0.875rem",
                        maxWidth: "480px",
                        margin: "4px 0 8px 0",
                        lineHeight: "1.5",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                      }}
                    >
                      {slide.description}
                    </p>
                  )}
                  {slide.button_text && slide.button_link && (
                    <Link href={slide.button_link} className="hero-btn-custom">
                      {slide.button_text}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}

          {slides.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="hero-nav-arrow prev"
                aria-label="Slide sebelumnya"
                type="button"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextSlide}
                className="hero-nav-arrow next"
                aria-label="Slide berikutnya"
                type="button"
              >
                <ChevronRight size={20} />
              </button>
              <div className="hero-dots-container">
                {slides.map((slide, idx) => (
                  <button
                    key={slide.id_banner}
                    type="button"
                    onClick={() => setCurrent(idx)}
                    className={`hero-dot ${idx === current ? "active" : ""}`}
                    aria-label={`Ke slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
  );
}
