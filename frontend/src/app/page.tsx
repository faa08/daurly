"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import HeroBanner from "@/components/HeroBanner";
import HeroPromoSideBanners from "@/components/HeroPromoSideBanners";
import TahukahKamu from "@/components/TahukahKamu";
import Categories from "@/components/Categories";
import FeaturedProducts from "@/components/FeaturedProducts";
import Footer from "@/components/Footer";
import { useCustomerService } from "@/components/CustomerServiceProvider";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { open: openCustomerService } = useCustomerService();

  return (
    <>
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <div className="responsive-hide-desktop">
        <SearchBar query={searchQuery} setQuery={setSearchQuery} />
      </div>
      <main>
        {/* Shopee-Style Split Hero Banner Grid */}
        <section className="hero-section-container">
          <div className="home-hero-grid">
            <div style={{ position: "relative" }}>
              <HeroBanner />
            </div>
            <div className="home-hero-side-banners-container">
              <HeroPromoSideBanners />
            </div>
          </div>
        </section>

        {/* Quick Links / Menu Pintas (Shopee-Style) */}
        <div className="quick-links-row">
          <button
            onClick={() => openCustomerService("admin")}
            className="quick-link-item"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            <div className="quick-link-icon-box">
              <span className="material-symbols-outlined">support_agent</span>
            </div>
            <span className="quick-link-text">CS Admin</span>
          </button>
          
          <button
            onClick={() => openCustomerService("ai")}
            className="quick-link-item"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            <div className="quick-link-icon-box">
              <span className="material-symbols-outlined">smart_toy</span>
            </div>
            <span className="quick-link-text">CS AI</span>
          </button>

          <Link href="/kategori" className="quick-link-item">
            <div className="quick-link-icon-box">
              <span className="material-symbols-outlined">grid_view</span>
            </div>
            <span className="quick-link-text">Semua Produk</span>
          </Link>

          <div
            className="quick-link-item"
            style={{ opacity: 0.6, cursor: "not-allowed" }}
            title="Akan segera hadir!"
          >
            <div className="quick-link-icon-box" style={{ background: "#F5F3F0" }}>
              <span className="material-symbols-outlined" style={{ color: "#8E8680" }}>handshake</span>
            </div>
            <span className="quick-link-text" style={{ color: "#8E8680" }}>
              Affiliate<br />
              <span style={{ fontSize: "0.55rem", fontWeight: 800, color: "#16A34A" }}>(Coming Soon)</span>
            </span>
          </div>
        </div>

        <Categories />
        <FeaturedProducts searchQuery={searchQuery} />

        {/* "Tahukah Kamu?" Eco-Facts Widget */}
        <div style={{ maxWidth: "1200px", margin: "32px auto", padding: "0 24px" }}>
          <TahukahKamu />
        </div>
      </main>
      <Footer />
    </>
  );
}
