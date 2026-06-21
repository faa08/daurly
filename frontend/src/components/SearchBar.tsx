"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Utensils, 
  Shirt, 
  Paintbrush, 
  Wrench, 
  Sparkles,
  TrendingUp,
  Tag
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const QUICK_SEARCHES = [
  "Kopi Arabika",
  "Batik Solo",
  "Kerajinan Rotan",
  "Snack Nusantara",
];

const SUGGESTION_ITEMS = [
  // Products
  { name: "Mangkuk Keramik Motif Megamendung", category: "Kerajinan", slug: "kerajinan", link: "/produk/mangkuk-keramik-megamendung" },
  { name: "Kopi Toraja Arabika Premium", category: "Kuliner", slug: "kuliner", link: "/produk/kopi-toraja-arabika-250g" },
  { name: "Dompet Kulit Sapi Asli Cognac Brown", category: "Fashion", slug: "fashion", link: "/produk/dompet-kulit-cognac-brown" },
  { name: "Paket Perawatan Wajah Alami Kunyit", category: "Kecantikan", slug: "kecantikan", link: "/produk/skincare-kunyit-alami" },
  { name: "Kain Batik Tulis Motif Truntum", category: "Fashion", slug: "fashion", link: "/produk/batik-tulis-truntum-klasik" },
  { name: "Gelas Keramik Motif Batik Indigo", category: "Kerajinan", slug: "kerajinan", link: "/produk/gelas-keramik-motif-batik" },
  { name: "Piring Dekoratif Batik Parang", category: "Kerajinan", slug: "kerajinan", link: "/produk/piring-dekoratif-batik" },
  { name: "Set Wadah Sambel Keramik Handmade", category: "Kerajinan", slug: "kerajinan", link: "/produk/set-wadah-sambel-keramik" },
  { name: "Vas Bunga Keramik Kontemporer", category: "Kerajinan", slug: "kerajinan", link: "/produk/vas-bunga-keramik" },
  { name: "Sambal Bawang Pedas Asli Surabaya", category: "Kuliner", slug: "kuliner", link: "/produk/sambal-bawang-pedas" },
  { name: "Tas Selendang Tenun Tradisional Lombok", category: "Fashion", slug: "fashion", link: "/produk/tas-selendang-tenun" },
  { name: "Jasa Desain Kemasan Produk UMKM", category: "Jasa", slug: "jasa", link: "/produk/jasa-desain-kemasan" },
  { name: "Jasa Foto Produk Editorial Profesional", category: "Jasa", slug: "jasa", link: "/produk/jasa-foto-produk" },
  // Categories
  { name: "Kuliner Nusantara", category: "Kategori", slug: "kategori", link: "/kategori/kuliner" },
  { name: "Fashion & Busana", category: "Kategori", slug: "kategori", link: "/kategori/fashion" },
  { name: "Kerajinan Tangan", category: "Kategori", slug: "kategori", link: "/kategori/kerajinan" },
  { name: "Jasa Kreatif", category: "Kategori", slug: "kategori", link: "/kategori/jasa" },
  { name: "Kecantikan & Kesehatan", category: "Kategori", slug: "kategori", link: "/kategori/kecantikan" },
];

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<typeof SUGGESTION_ITEMS>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Handle suggestion filtering
  useEffect(() => {
    if (query.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    const filtered = SUGGESTION_ITEMS.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
    );
    setSuggestions(filtered.slice(0, 6)); // limit to 6 suggestions
    setActiveIndex(-1);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev === suggestions.length - 1 ? 0 : prev + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        const selected = suggestions[activeIndex];
        setQuery(selected.name);
        router.push(selected.link);
        setShowSuggestions(false);
      } else {
        handleSearchSubmit();
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const getCategoryIcon = (category: string, slug?: string) => {
    const s = slug || category.toLowerCase();
    if (s === "kuliner") return <Utensils size={14} />;
    if (s === "fashion") return <Shirt size={14} />;
    if (s === "kerajinan") return <Paintbrush size={14} />;
    if (s === "jasa") return <Wrench size={14} />;
    if (s === "kecantikan") return <Sparkles size={14} />;
    if (s === "kategori") return <Tag size={14} />;
    return <Search size={14} />;
  };

  return (
    <div className="searchbar-section" style={{ position: "relative" }}>
      <div 
        ref={containerRef}
        style={{ position: "relative", width: "100%", maxWidth: "600px" }}
      >
        <div className="search-box-centered" style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Cari produk lokal, kerajinan, atau kuliner..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            className="search-input-custom"
            id="search-input"
            autoComplete="off"
          />
          <button 
            className="search-button-custom" 
            aria-label="Cari"
            onClick={handleSearchSubmit}
          >
            <Search size={16} />
            <span>Cari</span>
          </button>
        </div>

        {/* Suggestion Dropdown Panel */}
        {showSuggestions && suggestions.length > 0 && (
          <div 
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              background: "white",
              border: "1px solid #EAE5E0",
              borderRadius: "8px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              zIndex: 999,
              maxHeight: "350px",
              overflowY: "auto",
              padding: "6px 0",
            }}
            id="search-suggestions-panel"
          >
            <div style={{ padding: "6px 16px 4px", fontSize: "0.7rem", fontWeight: 700, color: "#8E8680", letterSpacing: "0.05em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
              <TrendingUp size={12} />
              <span>Rekomendasi Pencarian</span>
            </div>

            {suggestions.map((item, idx) => {
              const isActive = idx === activeIndex;
              return (
                <Link
                  key={idx}
                  href={item.link}
                  onClick={() => setShowSuggestions(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 16px",
                    background: isActive ? "#FFF3ED" : "transparent",
                    cursor: "pointer",
                    textDecoration: "none",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={() => setActiveIndex(idx)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                    <span style={{ color: isActive ? "#E8600A" : "#8E8680", display: "flex", alignItems: "center", flexShrink: 0 }}>
                      {getCategoryIcon(item.category, item.slug)}
                    </span>
                    <span 
                      style={{ 
                        fontSize: "0.85rem", 
                        fontWeight: isActive ? 700 : 500, 
                        color: "#1F1B18",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.name}
                    </span>
                  </div>
                  <span 
                    style={{ 
                      fontSize: "0.7rem", 
                      background: item.category === "Kategori" ? "#E8600A" : "#F6F4F0",
                      color: item.category === "Kategori" ? "white" : "#5C5550",
                      padding: "2px 8px", 
                      borderRadius: "10px",
                      fontWeight: 700,
                      marginLeft: 8,
                      flexShrink: 0
                    }}
                  >
                    {item.category}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="search-tags-centered">
        {QUICK_SEARCHES.map((tag) => (
          <button
            key={tag}
            className="search-tag-link"
            onClick={() => {
              setQuery(tag);
              router.push(`/search?q=${encodeURIComponent(tag)}`);
            }}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
