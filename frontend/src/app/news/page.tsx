"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/backend/supabase";

const isPlaceholder = () =>
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "Baru saja";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} menit yang lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam yang lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari yang lalu`;
  
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function NewsPage() {
  const [newsList, setNewsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchNews = async () => {
      if (isPlaceholder()) {
        setNewsList([
          {
            id: "news-1",
            judul: "Pentingnya Daur Ulang Plastik untuk Masa Depan Bumi",
            penulis: "Budi Santoso",
            ringkasan: "Daur ulang plastik adalah langkah penting menekan pencemaran yang semakin mengancam kelestarian lingkungan laut kita.",
            image_urls: [
              "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=1200&auto=format&fit=crop"
            ],
            status: "Published",
            created_at: new Date().toISOString(),
          },
          {
            id: "news-2",
            judul: "Inovasi Baru Pengelolaan Sampah Organik di Rumah Tangga",
            penulis: "Siti Aminah",
            ringkasan: "Membuat kompos dari sisa makanan ternyata sangat mudah dan bermanfaat bagi tanaman hias Anda.",
            image_urls: [
              "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?q=80&w=800&auto=format&fit=crop"
            ],
            status: "Published",
            created_at: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: "news-3",
            judul: "Komunitas Peduli Lingkungan Bersihkan Pantai Selatan",
            penulis: "Reporter DaurlY",
            ringkasan: "Ratusan relawan berkumpul untuk membersihkan pesisir pantai dari sampah plastik.",
            image_urls: [
              "https://images.unsplash.com/photo-1618477461853-cf6ed80fbea5?q=80&w=800&auto=format&fit=crop"
            ],
            status: "Published",
            created_at: new Date(Date.now() - 172800000).toISOString(),
          },
          {
            id: "news-4",
            judul: "Dampak Sampah Elektronik (E-Waste) dan Cara Mengatasinya",
            penulis: "Admin Lingkungan",
            ringkasan: "Ketahui bahaya sampah elektronik yang menumpuk di laci rumahmu dan tempat pembuangannya yang tepat.",
            image_urls: [
              "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=800&auto=format&fit=crop"
            ],
            status: "Published",
            created_at: new Date(Date.now() - 259200000).toISOString(),
          },
        ]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("berita")
          .select("id, judul, penulis, ringkasan, image_urls, video_url, created_at")
          .eq("status", "Published")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setNewsList(data || []);
      } catch (err) {
        console.error("Gagal memuat berita:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const heroNews = newsList.length > 0 ? newsList[0] : null;
  const feedNews = newsList.length > 1 ? newsList.slice(1) : [];

  return (
    <>
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <main className="min-h-screen bg-[#FCFCFA] pt-8 pb-20">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-[#1F1B18] mb-2">Portal Berita</h1>
            <p className="text-[#645F5B] text-lg">Kabar terbaru seputar lingkungan, daur ulang, dan inovasi hijau.</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <span className="material-symbols-outlined animate-spin text-4xl text-[#16A34A]">progress_activity</span>
            </div>
          ) : newsList.length === 0 ? (
            <div className="text-center py-20 text-[#645F5B]">
              <span className="material-symbols-outlined text-6xl mb-4 text-[#D5CFC9]">newspaper</span>
              <p className="text-lg">Belum ada berita yang dipublikasikan.</p>
            </div>
          ) : (
            <>
              {/* Hero Section */}
              {heroNews && (
                <Link href={`/news/${heroNews.id}`} className="group block mb-12">
                  <div className="relative rounded-2xl overflow-hidden shadow-sm aspect-video md:aspect-[21/9] bg-gray-200">
                    <img 
                      src={heroNews.image_urls?.[0] || "https://images.unsplash.com/photo-1528323273322-d81458248d40?q=80&w=1200&auto=format&fit=crop"} 
                      alt={heroNews.judul}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                      <div className="flex items-center gap-3 text-white/80 text-sm mb-3 font-medium">
                        <span className="material-symbols-outlined text-base">schedule</span>
                        {formatTimeAgo(heroNews.created_at)}
                        {heroNews.penulis && (
                          <>
                            <span>•</span>
                            <span className="material-symbols-outlined text-base">person</span>
                            {heroNews.penulis}
                          </>
                        )}
                      </div>
                      <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-3 group-hover:underline decoration-white decoration-2 underline-offset-4">
                        {heroNews.judul}
                      </h2>
                      <p className="text-white/90 text-base md:text-lg line-clamp-2 max-w-3xl">
                        {heroNews.ringkasan}
                      </p>
                    </div>
                  </div>
                </Link>
              )}

              {/* Grid Feed */}
              {feedNews.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-[#1F1B18] mb-6 flex items-center gap-2 border-b border-[#EAE5E0] pb-3">
                    <span className="material-symbols-outlined text-[#16A34A]">article</span>
                    Berita Terbaru Lainnya
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {feedNews.map((news) => (
                      <Link href={`/news/${news.id}`} key={news.id} className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm border border-[#EAE5E0] hover:shadow-md transition-shadow">
                        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                          <img 
                            src={news.image_urls?.[0] || "https://images.unsplash.com/photo-1528323273322-d81458248d40?q=80&w=800&auto=format&fit=crop"} 
                            alt={news.judul}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          {news.video_url && (
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <span className="material-symbols-outlined text-5xl text-white drop-shadow-md">play_circle</span>
                            </div>
                          )}
                        </div>
                        <div className="p-5 flex flex-col flex-grow">
                          <div className="flex items-center gap-2 text-xs text-[#645F5B] mb-3 font-medium">
                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                            {formatTimeAgo(news.created_at)}
                          </div>
                          <h4 className="text-lg font-bold text-[#1F1B18] mb-2 line-clamp-2 group-hover:text-[#16A34A] transition-colors">
                            {news.judul}
                          </h4>
                          <p className="text-[#5C5550] text-sm line-clamp-3 mb-4 flex-grow">
                            {news.ringkasan}
                          </p>
                          <div className="mt-auto text-[#16A34A] font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                            Baca Selengkapnya
                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
