"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/backend/supabase";

const isPlaceholder = () =>
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [news, setNews] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchNewsDetail = async () => {
      const id = params?.id as string;
      if (!id) return;

      if (isPlaceholder()) {
        // Mock data
        setNews({
          id: id,
          judul: "Pentingnya Daur Ulang Plastik untuk Masa Depan Bumi",
          penulis: "Budi Santoso",
          ringkasan: "Daur ulang plastik adalah langkah penting menekan pencemaran yang semakin mengancam kelestarian lingkungan laut kita.",
          konten: `
            <p><strong>Plastik</strong> adalah salah satu material yang paling banyak digunakan di dunia, namun sayangnya ia tidak mudah terurai di alam.</p>
            <br/>
            <p>Menurut penelitian terbaru, jutaan ton sampah plastik berakhir di lautan setiap tahunnya. Hal ini sangat mengancam ekosistem laut dan biota yang ada di dalamnya. Oleh karena itu, langkah <em>daur ulang</em> menjadi sangat krusial.</p>
            <ul>
              <li>Mengurangi polusi</li>
              <li>Menghemat energi</li>
              <li>Menyelamatkan satwa liar</li>
            </ul>
            <p>Mari kita mulai kebiasaan memilah sampah dari rumah!</p>
          `,
          image_urls: [
            "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?q=80&w=800&auto=format&fit=crop"
          ],
          video_url: "",
          status: "Published",
          created_at: new Date().toISOString(),
        });
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("berita")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        if (!data) {
          router.push("/news");
          return;
        }

        setNews(data);
      } catch (err) {
        console.error("Gagal memuat detail berita:", err);
        alert("Berita tidak ditemukan.");
        router.push("/news");
      } finally {
        setLoading(false);
      }
    };

    fetchNewsDetail();
  }, [params?.id, router]);

  if (loading) {
    return (
      <>
        <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div className="min-h-screen bg-[#FCFCFA] flex justify-center items-center">
          <span className="material-symbols-outlined animate-spin text-5xl text-[#16A34A]">progress_activity</span>
        </div>
      </>
    );
  }

  if (!news) return null;

  return (
    <>
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      <main className="min-h-screen bg-[#FCFCFA] pt-6 pb-20">
        <article className="max-w-[800px] mx-auto px-4 md:px-6">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[#645F5B] mb-8 font-medium">
            <Link href="/" className="hover:text-[#16A34A] transition-colors">Beranda</Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <Link href="/news" className="hover:text-[#16A34A] transition-colors">Portal Berita</Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-[#1F1B18] truncate max-w-[200px] md:max-w-none">{news.judul}</span>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-5xl font-playfair font-bold text-[#1F1B18] leading-[1.2] mb-6">
              {news.judul}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-[#645F5B] border-y border-[#EAE5E0] py-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#EAE5E0] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#1F1B18]">person</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1F1B18]">{news.penulis || "Tim DaurlY"}</p>
                  <p className="text-xs">Penulis</p>
                </div>
              </div>
              <div className="w-px h-8 bg-[#EAE5E0] hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">calendar_month</span>
                <span className="text-sm font-medium">
                  {new Date(news.created_at).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </header>

          {/* Media Utama */}
          <div className="mb-10">
            {news.image_urls && news.image_urls.length > 0 ? (
              <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-video md:aspect-[16/9] shadow-sm">
                <img 
                  src={news.image_urls[0]} 
                  alt={news.judul} 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : news.video_url ? (
              <div className="rounded-2xl overflow-hidden shadow-sm aspect-video bg-black flex items-center justify-center">
                <a href={news.video_url} target="_blank" rel="noreferrer" className="flex flex-col items-center group">
                  <span className="material-symbols-outlined text-white text-6xl group-hover:text-[#16A34A] transition-colors drop-shadow-lg">play_circle</span>
                  <span className="text-white mt-2 group-hover:text-[#16A34A] transition-colors">Tonton Video di YouTube</span>
                </a>
              </div>
            ) : null}
            {news.image_urls && news.image_urls.length > 0 && (
              <p className="text-center text-xs text-[#645F5B] mt-2 italic">Ilustrasi: {news.judul}</p>
            )}
          </div>

          {/* Konten Berita - Rich Text */}
          <div className="prose prose-lg prose-green max-w-none mb-12 text-[#3E3834] leading-relaxed overflow-hidden break-words">
            {news.konten ? (
              <div 
                dangerouslySetInnerHTML={{ __html: news.konten }} 
                className="w-full max-w-full [&>*]:max-w-full [&_img]:max-w-full [&_p]:whitespace-pre-wrap [&_p]:break-words"
              />
            ) : (
              <p className="italic text-gray-500">Tidak ada konten untuk berita ini.</p>
            )}
          </div>

          {/* Galeri Tambahan (Jika ada lebih dari 1 gambar) */}
          {news.image_urls && news.image_urls.length > 1 && (
            <div className="mb-12 pt-8 border-t border-[#EAE5E0]">
              <h3 className="text-2xl font-bold text-[#1F1B18] mb-6 font-playfair">Galeri Foto</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {news.image_urls.slice(1).map((url: string, index: number) => (
                  <div key={index} className="aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-zoom-in hover:shadow-md transition-shadow">
                    <a href={url} target="_blank" rel="noreferrer">
                      <img src={url} alt={`Galeri ${index + 1}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Footer Artikel */}
          <footer className="pt-6 border-t border-[#EAE5E0] flex justify-between items-center">
            <Link href="/news" className="text-[#16A34A] font-semibold flex items-center gap-2 hover:gap-3 transition-all">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Kembali ke Indeks Berita
            </Link>
            
            <div className="flex gap-2">
              <button onClick={() => navigator.clipboard.writeText(window.location.href).then(() => alert('Link disalin!'))} className="w-10 h-10 rounded-full bg-[#EAE5E0] hover:bg-[#D5CFC9] flex items-center justify-center transition-colors" title="Bagikan">
                <span className="material-symbols-outlined text-[#1F1B18] text-lg">share</span>
              </button>
            </div>
          </footer>

        </article>
      </main>
    </>
  );
}
