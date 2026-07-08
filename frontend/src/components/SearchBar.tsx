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

  Tag,

  Store,

  Loader2,

} from "lucide-react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { productService, type SearchSuggestion } from "@/backend/productService";

import { QUICK_SEARCH_TAGS } from "@/lib/quickSearchTags";



interface SearchBarProps {

  query?: string;

  setQuery?: (q: string) => void;

}



export default function SearchBar({ query: externalQuery, setQuery: externalSetQuery }: SearchBarProps) {

  const [internalQuery, setInternalQuery] = useState("");



  useEffect(() => {

    if (externalQuery !== undefined) {

      setInternalQuery(externalQuery);

    }

  }, [externalQuery]);



  const query = externalQuery !== undefined ? externalQuery : internalQuery;

  const setQuery = (q: string) => {

    setInternalQuery(q);

    if (externalSetQuery) {

      externalSetQuery(q);

    }

  };



  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);

  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const [showSuggestions, setShowSuggestions] = useState(false);

  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const [quickTags, setQuickTags] = useState<(typeof QUICK_SEARCH_TAGS)[number][]>([]);

  useEffect(() => {
    productService.getProducts({ publicOnly: true, limit: 200 }).then((products) => {
      const counts = new Map<string, number>();
      for (const p of products) {
        const slug = p.categorySlug;
        if (!slug) continue;
        counts.set(slug, (counts.get(slug) || 0) + 1);
      }
      setQuickTags(QUICK_SEARCH_TAGS.filter((tag) => (counts.get(tag.slug) || 0) > 0));
    });
  }, []);



  useEffect(() => {

    if (query.trim().length === 0) {

      setSuggestions([]);

      setSuggestionsLoading(false);

      return;

    }



    let cancelled = false;

    const timer = setTimeout(async () => {

      setSuggestionsLoading(true);

      try {

        const results = await productService.searchSuggestions(query, 8);

        if (!cancelled) {

          setSuggestions(results);

          setActiveIndex(-1);

        }

      } catch {

        if (!cancelled) setSuggestions([]);

      } finally {

        if (!cancelled) setSuggestionsLoading(false);

      }

    }, 300);



    return () => {

      cancelled = true;

      clearTimeout(timer);

    };

  }, [query]);



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



  const getSuggestionIcon = (item: SearchSuggestion) => {

    if (item.type === "store") return <Store size={14} />;

    if (item.type === "category") return <Tag size={14} />;

    const s = item.slug || item.category.toLowerCase();

    if (s === "kuliner") return <Utensils size={14} />;

    if (s === "fashion") return <Shirt size={14} />;

    if (s === "kerajinan") return <Paintbrush size={14} />;

    if (s === "jasa") return <Wrench size={14} />;

    if (s === "kecantikan") return <Sparkles size={14} />;

    return <Search size={14} />;

  };



  const getBadgeStyle = (item: SearchSuggestion) => {

    if (item.type === "category") {

      return { background: "#E8600A", color: "white" };

    }

    if (item.type === "store") {

      return { background: "#1D4ED8", color: "white" };

    }

    return { background: "#F6F4F0", color: "#5C5550" };

  };



  const showPanel = showSuggestions && query.trim().length > 0;



  return (

    <div className="searchbar-section" style={{ position: "relative" }}>

      <div

        ref={containerRef}

        style={{ position: "relative", width: "100%", maxWidth: "600px" }}

      >

        <div className="search-box-centered" style={{ position: "relative" }}>

          <input

            type="text"

            placeholder="Cari produk daur ulang, toko perajin, atau kategori..."

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



        {showPanel && (

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

            <div

              style={{

                padding: "6px 16px 4px",

                fontSize: "0.7rem",

                fontWeight: 700,

                color: "#8E8680",

                letterSpacing: "0.05em",

                textTransform: "uppercase",

                display: "flex",

                alignItems: "center",

                gap: 6,

              }}

            >

              {suggestionsLoading ? <Loader2 size={12} className="animate-spin" /> : <TrendingUp size={12} />}

              <span>{suggestionsLoading ? "Mencari..." : "Rekomendasi Pencarian"}</span>

            </div>



            {!suggestionsLoading && suggestions.length === 0 && (

              <p style={{ padding: "12px 16px", fontSize: "0.8125rem", color: "#8E8680", margin: 0 }}>

                Tidak ada hasil untuk &quot;{query}&quot;

              </p>

            )}



            {suggestions.map((item, idx) => {

              const isActive = idx === activeIndex;

              const badgeStyle = getBadgeStyle(item);

              return (

                <Link

                  key={`${item.type}-${item.link}-${idx}`}

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

                    <span

                      style={{

                        color: isActive ? "#E8600A" : "#8E8680",

                        display: "flex",

                        alignItems: "center",

                        flexShrink: 0,

                      }}

                    >

                      {getSuggestionIcon(item)}

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

                      background: badgeStyle.background,

                      color: badgeStyle.color,

                      padding: "2px 8px",

                      borderRadius: "10px",

                      fontWeight: 700,

                      marginLeft: 8,

                      flexShrink: 0,

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



      {quickTags.length > 0 && (
      <div className="search-tags-centered">

        {quickTags.map((tag) => (

          <Link key={tag.label} href={tag.href} className="search-tag-pill">

            {tag.label}

          </Link>

        ))}

      </div>
      )}

    </div>

  );

}


