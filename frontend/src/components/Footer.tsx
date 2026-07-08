"use client";

import { useState } from "react";
import { Mail, MapPin, Globe } from "lucide-react";
import Link from "next/link";
import {
  CONTACT_EMAIL_MAILTO,
  PELATARAN_INSTAGRAM_URL,
  LINKPRODUCTIVE_INSTAGRAM_URL,
  LINKPRODUCTIVE_YOUTUBE_URL,
  LINKPRODUCTIVE_WEBSITE_URL,
} from "@/lib/siteContact";
import { PICKUP_STORE_ADDRESS, PICKUP_STORE_MAPS_URL } from "@/lib/checkoutConstants";

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

const COMPANY_LINKS = [
  { label: "Tentang Kami", href: "/tentang" },
  { label: "Model Konsinyasi", href: "/bantuan/konsinyasi" },
  { label: "Hubungi Kami", href: "/kontak" },
  { label: "Kebijakan Privasi", href: "/kebijakan-privasi" },
  { label: "Syarat & Ketentuan", href: "/bantuan/syarat-ketentuan" },
];

const HELP_LINKS = [
  { label: "Pusat Bantuan", href: "/bantuan" },
  { label: "Pembayaran & Pickup", href: "/bantuan/pembayaran" },
  { label: "Pengiriman & Chat", href: "/bantuan/info-pengiriman" },
  { label: "Kebijakan Return", href: "/bantuan/kebijakan-return" },
  { label: "FAQ", href: "/bantuan/faq" },
];

interface FooterProps {
  isMinimalist?: boolean;
}

export default function Footer({ isMinimalist = false }: FooterProps) {
  const [email, setEmail] = useState("");
  const [newsletterSent, setNewsletterSent] = useState(false);

  if (isMinimalist) {
    return (
      <footer style={{ textAlign: "center", padding: "20px 0", fontSize: "0.75rem", color: "#8E8680", borderTop: "1px solid #EAE5E0", background: "white" }}>
        <p>© {new Date().getFullYear()} Daurly Digital. Eco-friendly recycled goods.</p>
        <p style={{ marginTop: 6, opacity: 0.85 }}>Dikembangkan oleh PT Integrasi Produktivitas Indonesia</p>
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
              <span className="logo-text-bold-small">Daurly</span>
            </div>
            <p className="footer-desc-custom">
              Platform titip jual (konsinyasi) barang daur ulang. Kami urus penjualan, pembayaran, dan pengiriman — perajin fokus pada karya terbaiknya.
            </p>
            <div className="footer-location-custom">
              <p className="footer-desc-custom">{PICKUP_STORE_ADDRESS}</p>
              <a
                href={PICKUP_STORE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-maps-link"
              >
                <MapPin size={14} />
                Buka di Google Maps
              </a>
            </div>
            <div className="footer-social-custom">
              <a
                href={LINKPRODUCTIVE_WEBSITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn-custom"
                aria-label="Website Link Productive"
                title="linkproductive.com"
              >
                <Globe size={16} />
              </a>
              <a
                href={PELATARAN_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn-custom"
                aria-label="Instagram Daurly"
                title="Instagram Daurly"
              >
                <InstagramIcon size={16} />
              </a>
              <a
                href={LINKPRODUCTIVE_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn-custom"
                aria-label="Instagram Link Productive"
                title="Instagram Link Productive"
              >
                <InstagramIcon size={16} />
              </a>
              <a
                href={LINKPRODUCTIVE_YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn-custom"
                aria-label="YouTube Link Productive"
                title="YouTube Link Productive"
              >
                <YoutubeIcon size={16} />
              </a>
              <a
                href={CONTACT_EMAIL_MAILTO}
                className="social-btn-custom"
                aria-label="Email Link Productive"
                title="linkproductive@gmail.com"
              >
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
                if (email.trim()) setNewsletterSent(true);
                setEmail("");
              }}
            >
              {newsletterSent ? (
                <p className="newsletter-text-custom" style={{ color: "#15803D", fontWeight: 600 }}>
                  Terima kasih! Nantikan info terbaru di email Anda.
                </p>
              ) : (
                <>
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
                </>
              )}
            </form>
          </div>
        </div>

        <div className="footer-divider-custom" />
        
        <div className="footer-bottom-custom">
          <p>© {new Date().getFullYear()} Daurly. Eco-friendly recycled goods.</p>
          <p className="footer-dev-credit">
            Dikembangkan oleh{" "}
            <a
              href={LINKPRODUCTIVE_WEBSITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition"
            >
              PT Integrasi Produktivitas Indonesia
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
