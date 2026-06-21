"use client";

import { useState } from "react";
import { Search } from "lucide-react";

const QUICK_SEARCHES = [
  "Kopi Arabika",
  "Batik Solo",
  "Kerajinan Rotan",
  "Snack Nusantara",
];

interface SearchBarProps {
  query?: string;
  setQuery?: (q: string) => void;
}

export default function SearchBar({ query = "", setQuery }: SearchBarProps) {
  return (
    <div className="searchbar-section">
      <div className="search-box-centered">
        <input
          type="text"
          placeholder="Cari produk lokal, kerajinan, atau kuliner..."
          value={query}
          onChange={(e) => setQuery && setQuery(e.target.value)}
          className="search-input-custom"
          id="search-input"
        />
        <button className="search-button-custom" aria-label="Cari">
          <Search size={16} />
          <span>Cari</span>
        </button>
      </div>

      <div className="search-tags-centered">
        {QUICK_SEARCHES.map((tag) => (
          <button
            key={tag}
            className="search-tag-link"
            onClick={() => setQuery && setQuery(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
