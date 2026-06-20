"use client";

import { useState } from "react";
import { Globe, Share2, Mail } from "lucide-react";
import Link from "next/link";

const COMPANY_LINKS = [
  { label: "Tentang Kami", href: "/tentang" },
  { label: "Hubungi Kami", href: "/kontak" },
  { label: "Kebijakan Privasi", href: "/privasi" },
];

const HELP_LINKS = [
  { label: "Pusat Bantuan", href: "/bantuan" },
  { label: "Syarat & Ketentuan", href: "/syarat" },
  { label: "Informasi Pengiriman", href: "/pengiriman" },
  { label: "FAQ", href: "/faq" },
];

interface FooterProps {
  isMinimalist?: boolean;
}

export default function Footer({ isMinimalist = false }: FooterProps) {
  const [email, setEmail] = useState("");

  if (isMinimalist) {
    return (
      <footer style={{ textAlign: "center", padding: "20px 0", fontSize: "0.75rem", color: "#8E8680", borderTop: "1px solid #EAE5E0", background: "white" }}>
        © 2026 Pelataran UMKM Digital. Supporting local businesses.
      </footer>
    );
  }

  return (
    <footer className="footer-light-custom">
      <div className="container">
        <div className="footer-grid-custom">
          {/* Brand */}
          <div className="footer-brand-custom">
            <div className="footer-logo-custom">
              <div className="logo-stripes-small">
                <span className="stripe-orange-small"></span>
                <span className="stripe-gray-small"></span>
              </div>
              <span className="logo-text-bold-small">Pelataran UMKM</span>
            </div>
            <p className="footer-desc-custom">
              Platform e-commerce khusus produk UMKM Indonesia. Mari bersama memajukan ekonomi kerakyatan melalui produk berkualitas hasil karya anak bangsa.
            </p>
            <div className="footer-social-custom">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-btn-custom" aria-label="Instagram">
                <Globe size={16} />
              </a>
              <a href="#" className="social-btn-custom" aria-label="Share">
                <Share2 size={16} />
              </a>
              <a href="mailto:hello@pelataran.id" className="social-btn-custom" aria-label="Email">
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Company */}
          <div className="footer-column-custom">
            <p className="footer-heading-custom">PERUSAHAAN</p>
            <nav className="footer-links-custom">
              {COMPANY_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="footer-link-item">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Help */}
          <div className="footer-column-custom">
            <p className="footer-heading-custom">BANTUAN</p>
            <nav className="footer-links-custom">
              {HELP_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="footer-link-item">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Newsletter */}
          <div className="footer-column-custom">
            <p className="footer-heading-custom">NEWSLETTER</p>
            <p className="newsletter-text-custom">
              Dapatkan info produk terbaru dan promo menarik.
            </p>
            <form
              className="newsletter-form-custom"
              onSubmit={(e) => {
                e.preventDefault();
                setEmail("");
              }}
            >
              <input
                type="email"
                placeholder="Email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="newsletter-input-custom"
                id="newsletter-email"
                required
              />
              <button type="submit" className="newsletter-button-custom" id="newsletter-submit">
                OK
              </button>
            </form>
          </div>
        </div>

        <div className="footer-divider-custom" />
        
        <div className="footer-bottom-custom">
          <p>© 2024 Pelataran UMKM. Supporting local businesses.</p>
        </div>
      </div>
    </footer>
  );
}
