"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import HeroBanner from "@/components/HeroBanner";
import Categories from "@/components/Categories";
import FeaturedProducts from "@/components/FeaturedProducts";
import ValueProps from "@/components/ValueProps";
import Footer from "@/components/Footer";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <SearchBar query={searchQuery} setQuery={setSearchQuery} />
      <main>
        <HeroBanner />
        <Categories />
        <FeaturedProducts searchQuery={searchQuery} />
        <ValueProps />
      </main>
      <Footer />
    </>
  );
}
