"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/backend/supabase";
import dynamic from "next/dynamic";

// Memuat ReactQuill secara dinamis agar tidak error saat Server-Side Rendering (SSR) di Next.js
const ReactQuill = dynamic(() => import("react-quill-new"), { 
  ssr: false,
  loading: () => <p className="text-sm text-gray-500 py-4">Memuat Editor...</p>,
});
import "react-quill-new/dist/quill.snow.css";

const isPlaceholder = () =>
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

export default function AdminNewsPage() {
  const [newsList, setNewsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [formJudul, setFormJudul] = useState("");
  const [formPenulis, setFormPenulis] = useState("");
  const [formRingkasan, setFormRingkasan] = useState("");
  const [formKonten, setFormKonten] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  
  const [isUploading, setIsUploading] = useState(false);

  const fetchNews = async () => {
    if (isPlaceholder()) {
      setNewsList([
        {
          id: "news-1",
          judul: "Pentingnya Daur Ulang Plastik",
          penulis: "Admin Lingkungan",
          ringkasan: "Daur ulang plastik adalah langkah penting menekan pencemaran.",
          image_urls: [
            "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=200&auto=format&fit=crop"
          ],
          status: "Published",
          created_at: "2024-05-12T00:00:00Z",
        },
      ]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("berita")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNewsList(data || []);
    } catch (err: any) {
      console.error("fetchNews failed:", err.message || err);
      alert(`Gagal memuat berita. Error: ${err.message || JSON.stringify(err)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJudul.trim()) return;

    if (isPlaceholder()) {
      const newNews = {
        // eslint-disable-next-line react-hooks/purity
        id: `news-${Date.now()}`,
        judul: formJudul.trim(),
        penulis: formPenulis.trim(),
        ringkasan: formRingkasan.trim(),
        konten: formKonten,
        image_urls: imageFiles.length > 0 ? imageFiles.map(f => URL.createObjectURL(f)) : null,
        status: "Published",
        created_at: new Date().toISOString()
      };
      setNewsList([newNews, ...newsList]);
      resetForm();
      alert("Berita baru ditambahkan (Mode Uji Coba)!");
      return;
    }

    setIsUploading(true);
    try {
      let finalImageUrls: string[] = [];

      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const fileExt = file.name.split('.').pop();
          // eslint-disable-next-line react-hooks/purity
          const fileName = `news-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `news/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("products")
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from("products")
            .getPublicUrl(filePath);

          finalImageUrls.push(publicUrlData.publicUrl);
        }
      }

      const { error } = await supabase
        .from("berita")
        .insert([{
          judul: formJudul.trim(),
          penulis: formPenulis.trim() || null,
          ringkasan: formRingkasan.trim() || null,
          konten: formKonten,
          image_urls: finalImageUrls.length > 0 ? finalImageUrls : null,
          status: "Published"
        }]);

      if (error) throw error;

      alert("Berita berhasil ditambahkan!");
      resetForm();
      fetchNews();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Gagal menambah berita");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus berita ini?")) return;

    if (isPlaceholder()) {
      setNewsList(newsList.filter((n) => n.id !== id));
      return;
    }

    try {
      const { error } = await supabase
        .from("berita")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      fetchNews();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Gagal menghapus berita");
    }
  };

  const resetForm = () => {
    setFormJudul("");
    setFormPenulis("");
    setFormRingkasan("");
    setFormKonten("");
    setImageFiles([]);
    setShowAddForm(false);
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold text-[#1F1B18]">Manajemen Berita</h1>
          <p className="text-[#645F5B] mt-1">Kelola artikel, berita, dan dokumentasi untuk platform DaurlY.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#2D7A4D] hover:bg-[#23633E] text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors font-medium shadow-sm"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Tambah Berita
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl shadow-sm border border-[#E9E5E1] mb-6">
          <h2 className="text-xl font-bold text-[#1F1B18] mb-4">Tambah Berita Baru</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1F1B18] mb-1">Judul Berita</label>
              <input
                type="text"
                required
                value={formJudul}
                onChange={(e) => setFormJudul(e.target.value)}
                className="w-full border border-[#D5D1CD] rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2D7A4D]/20 focus:border-[#2D7A4D]"
                placeholder="Masukkan judul berita utama"
                disabled={isUploading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F1B18] mb-1">Penulis / Reporter</label>
              <input
                type="text"
                value={formPenulis}
                onChange={(e) => setFormPenulis(e.target.value)}
                className="w-full border border-[#D5D1CD] rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2D7A4D]/20 focus:border-[#2D7A4D]"
                placeholder="Misal: Budi Santoso"
                disabled={isUploading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F1B18] mb-1">Gambar (Thumbnail)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files) {
                    setImageFiles(Array.from(e.target.files));
                  }
                }}
                className="w-full border border-[#D5D1CD] rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2D7A4D]/20 focus:border-[#2D7A4D] bg-white"
                disabled={isUploading}
              />
              <p className="text-xs text-gray-500 mt-1">Pilih file gambar untuk thumbnail berita.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F1B18] mb-1">Ringkasan Singkat (Excerpt)</label>
              <textarea
                rows={2}
                value={formRingkasan}
                onChange={(e) => setFormRingkasan(e.target.value)}
                className="w-full border border-[#D5D1CD] rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2D7A4D]/20 focus:border-[#2D7A4D]"
                placeholder="Tulis ringkasan singkat 1-2 kalimat untuk preview di halaman depan..."
                disabled={isUploading}
              />
            </div>

            <div className="pb-8">
              <label className="block text-sm font-medium text-[#1F1B18] mb-1">Konten Berita</label>
              <div className="h-64 mb-10">
                <ReactQuill 
                  theme="snow" 
                  value={formKonten} 
                  onChange={setFormKonten} 
                  modules={modules}
                  readOnly={isUploading}
                  className="h-full"
                />
              </div>
            </div>
            
            <div className="flex gap-3 justify-end pt-6 border-t border-[#E9E5E1]">
              <button
                type="button"
                onClick={resetForm}
                disabled={isUploading}
                className="px-4 py-2 text-[#645F5B] hover:text-[#1F1B18] font-medium transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button 
                type="submit"
                disabled={isUploading}
                className="bg-[#2D7A4D] hover:bg-[#23633E] text-white px-6 py-2 rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Berita"
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-[#E9E5E1] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8F6F4] border-b border-[#E9E5E1]">
                <th className="px-6 py-4 text-sm font-semibold text-[#1F1B18]">Media</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#1F1B18]">Informasi Berita</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#1F1B18]">Penulis</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#1F1B18]">Tanggal</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#1F1B18] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E5E1]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#645F5B]">
                    Memuat data berita...
                  </td>
                </tr>
              ) : newsList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#645F5B]">
                    Belum ada berita.
                  </td>
                </tr>
              ) : (
                newsList.map((news) => (
                  <tr key={news.id} className="hover:bg-[#F8F6F4]/50 transition-colors">
                    <td className="px-6 py-4">
                      {news.image_urls && news.image_urls.length > 0 ? (
                        <div className="relative w-16 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={news.image_urls[0]} alt={news.judul} className="w-full h-full object-cover" />
                          {news.image_urls.length > 1 && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">+{news.image_urls.length - 1}</span>
                            </div>
                          )}
                        </div>
                      ) : news.video_url ? (
                        <div className="w-16 h-12 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center text-red-500">
                          <span className="material-symbols-outlined">play_circle</span>
                        </div>
                      ) : (
                        <div className="w-16 h-12 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                          <span className="material-symbols-outlined text-xl">newspaper</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#1F1B18]">{news.judul}</div>
                      <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">{news.ringkasan || "Tidak ada ringkasan"}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#645F5B]">
                      {news.penulis || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#645F5B]">
                      {new Date(news.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(news.id)}
                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
