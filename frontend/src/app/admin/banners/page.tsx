"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AlertCircle, ImageIcon, Plus, Trash2 } from "lucide-react";
import {
  deleteBanner,
  fetchAllBannersAdmin,
  saveBanner,
  uploadBannerImage,
  type SiteBanner,
  type SiteBannerInput,
} from "@/backend/bannerService";
import {
  DEFAULT_CATEGORY_HERO_SLUGS,
  DEFAULT_HOME_HERO_SLIDES,
  DEFAULT_CATEGORY_HERO,
} from "@/lib/defaultBanners";

type Tab = "home" | "category";

const inputClass =
  "w-full px-3 py-2.5 rounded-lg border border-[#D5CFC9] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]";

function emptyHomeSlide(sortOrder: number): SiteBannerInput {
  return {
    banner_kind: "home_hero",
    category_slug: "",
    badge: "",
    title_line1: "",
    title_line2: "",
    description: "",
    button_text: "",
    button_link: "/",
    image_url: "",
    image_position: "center center",
    sort_order: sortOrder,
    is_active: true,
  };
}

export default function AdminBannersPage() {
  const [tab, setTab] = useState<Tab>("home");
  const [banners, setBanners] = useState<SiteBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [categorySlug, setCategorySlug] = useState("kuliner");

  const homeSlides = banners
    .filter((b) => b.banner_kind === "home_hero")
    .sort((a, b) => a.sort_order - b.sort_order);

  const categoryBanner = banners.find(
    (b) => b.banner_kind === "category_hero" && b.category_slug === categorySlug
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchAllBannersAdmin();
      setBanners(rows);
    } catch {
      setError("Gagal memuat banner. Pastikan tabel site_banner sudah dimigrasi di Supabase.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function persistBanner(input: SiteBannerInput & { id_banner?: string }) {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const saved = await saveBanner(input);
      setBanners((prev) => {
        const rest = prev.filter((b) => b.id_banner !== saved.id_banner);
        return [...rest, saved];
      });
      setMessage("Banner berhasil disimpan.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Hapus slide banner ini?")) return;
    if (id.startsWith("default-")) {
      alert("Slide default belum tersimpan di database. Simpan dulu sebelum menghapus.");
      return;
    }
    try {
      await deleteBanner(id);
      setMessage("Banner dihapus.");
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus.");
    }
  }

  function seedHomeFromDefaults() {
    return DEFAULT_HOME_HERO_SLIDES.map((row, i) => ({
      ...row,
      id_banner: `draft-home-${i}`,
    })) as SiteBanner[];
  }

  function getCategoryDraft(): SiteBanner {
    if (categoryBanner) return categoryBanner;
    const def = DEFAULT_CATEGORY_HERO[categorySlug];
    return {
      id_banner: `draft-cat-${categorySlug}`,
      banner_kind: "category_hero",
      category_slug: categorySlug,
      badge: def?.badge ?? "Galeri Daur Ulang Pilihan",
      title_line1: def?.title_line1 ?? "",
      title_line2: null,
      description: def?.description ?? "",
      button_text: null,
      button_link: null,
      image_url: def?.image_url ?? "",
      image_position: def?.image_position ?? "center center",
      sort_order: 0,
      is_active: true,
    };
  }

  const displayCategory = getCategoryDraft();

  return (
    <div className="space-y-8">
      <header>
        <h2 className="font-headline text-3xl font-bold text-[#1F1B18]">Banner & Hero</h2>
        <p className="text-sm text-[#5C5550] mt-1">
          Edit slider beranda dan banner halaman kategori — unggah gambar dari perangkat Anda (tanpa perlu URL).
        </p>
      </header>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {message && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800 font-semibold">
          {message}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "home" as Tab, label: "Slider Beranda" },
            { id: "category" as Tab, label: "Banner Kategori" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
              tab === t.id ? "bg-[#16A34A] text-white" : "bg-white border border-[#EAE5E0] text-[#5C5550]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-[#8E8680] font-semibold py-12 text-center">Memuat banner...</p>
      ) : tab === "home" ? (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                const draft = emptyHomeSlide(homeSlides.length);
                setBanners((prev) => [
                  ...prev,
                  { ...draft, id_banner: `draft-new-${Date.now()}` } as SiteBanner,
                ]);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#16A34A] text-white text-xs font-bold rounded-lg hover:brightness-95"
            >
              <Plus size={14} />
              Tambah Slide
            </button>
          </div>

          {(homeSlides.length ? homeSlides : seedHomeFromDefaults()).map((slide, idx) => (
            <HomeSlideForm
              key={slide.id_banner}
              slide={slide}
              index={idx}
              saving={saving}
              onSave={persistBanner}
              onDelete={() => handleDelete(slide.id_banner)}
            />
          ))}
        </div>
      ) : (
        <CategoryBannerForm
          key={categorySlug}
          slug={categorySlug}
          banner={displayCategory}
          saving={saving}
          onSlugChange={setCategorySlug}
          onSave={persistBanner}
        />
      )}
    </div>
  );
}

function ImagePreview({ url }: { url: string }) {
  if (!url) {
    return (
      <div className="w-full h-40 bg-[#F5F3F0] rounded-lg border border-dashed border-[#D5CFC9] flex flex-col items-center justify-center text-[#8E8680] text-xs gap-2">
        <ImageIcon size={22} />
        <span>Belum ada gambar — unggah dari perangkat Anda</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="Preview banner" className="w-full h-40 object-cover rounded-lg border border-[#EAE5E0]" />
  );
}

function BannerImageUpload({
  imageUrl,
  uploading,
  onFile,
}: {
  imageUrl: string;
  uploading: boolean;
  onFile: (file: File) => void;
}) {
  return (
    <div className="space-y-2">
      <ImagePreview url={imageUrl} />
      <label
        className={`relative flex flex-col items-center justify-center w-full h-24 rounded-lg border-2 border-dashed transition cursor-pointer ${
          uploading
            ? "border-[#16A34A] bg-[#F0FDF4] opacity-70 pointer-events-none"
            : "border-[#D5CFC9] bg-[#FAFAF8] hover:border-[#16A34A] hover:bg-[#F0FDF4]"
        }`}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="absolute inset-0 opacity-0 cursor-pointer"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
            e.target.value = "";
          }}
        />
        <ImageIcon size={20} className="text-[#8E8680] mb-1" />
        <span className="text-xs font-bold text-[#5C5550]">
          {uploading ? "Mengunggah..." : imageUrl ? "Ganti Gambar" : "Pilih Gambar Banner"}
        </span>
        <span className="text-[10px] text-[#8E8680] mt-0.5">JPG, PNG, atau WebP · maks. 3MB</span>
      </label>
    </div>
  );
}

function HomeSlideForm({
  slide,
  index,
  saving,
  onSave,
  onDelete,
}: {
  slide: SiteBanner;
  index: number;
  saving: boolean;
  onSave: (input: SiteBannerInput & { id_banner?: string }) => Promise<void>;
  onDelete: () => void;
}) {
  const [form, setForm] = useState(slide);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setForm(slide);
  }, [slide]);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const url = await uploadBannerImage(file);
      setForm((f) => ({ ...f, image_url: url }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengunggah gambar.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      className="bg-white border border-[#EAE5E0] rounded-xl p-6 shadow-sm space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!form.image_url?.trim()) {
          alert("Unggah gambar banner terlebih dahulu.");
          return;
        }
        const id = form.id_banner.startsWith("draft-") ? undefined : form.id_banner;
        onSave({
          id_banner: id,
          banner_kind: "home_hero",
          category_slug: "",
          badge: form.badge,
          title_line1: form.title_line1,
          title_line2: form.title_line2,
          description: form.description,
          button_text: form.button_text,
          button_link: form.button_link,
          image_url: form.image_url,
          image_position: form.image_position,
          sort_order: index,
          is_active: form.is_active,
        });
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-bold text-[#1F1B18]">Slide {index + 1}</h3>
        {!form.id_banner.startsWith("draft-") && (
          <button type="button" onClick={onDelete} className="text-red-600 text-xs font-bold flex items-center gap-1">
            <Trash2 size={14} />
            Hapus
          </button>
        )}
      </div>

      <BannerImageUpload
        imageUrl={form.image_url}
        uploading={uploading}
        onFile={(file) => void handleFile(file)}
      />

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase text-[#8E8680] mb-1">Badge</label>
          <input className={inputClass} value={form.badge || ""} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase text-[#8E8680] mb-1">Judul Baris 1</label>
          <input className={inputClass} value={form.title_line1 || ""} onChange={(e) => setForm({ ...form, title_line1: e.target.value })} required />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase text-[#8E8680] mb-1">Judul Baris 2</label>
          <input className={inputClass} value={form.title_line2 || ""} onChange={(e) => setForm({ ...form, title_line2: e.target.value })} />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase text-[#8E8680] mb-1">Teks Tombol</label>
          <input className={inputClass} value={form.button_text || ""} onChange={(e) => setForm({ ...form, button_text: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold uppercase text-[#8E8680] mb-1">Deskripsi</label>
          <textarea className={inputClass} rows={2} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase text-[#8E8680] mb-1">Link Tombol</label>
          <input className={inputClass} value={form.button_link || ""} onChange={(e) => setForm({ ...form, button_link: e.target.value })} placeholder="/kategori/fashion" />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm font-semibold text-[#3E3834]">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Aktif (tampil di beranda)
          </label>
        </div>
      </div>

      <button type="submit" disabled={saving} className="px-5 py-2.5 bg-[#16A34A] text-white text-xs font-bold rounded-lg disabled:opacity-60">
        {saving ? "Menyimpan..." : "Simpan Slide"}
      </button>
    </form>
  );
}

function CategoryBannerForm({
  slug,
  banner,
  saving,
  onSlugChange,
  onSave,
}: {
  slug: string;
  banner: SiteBanner;
  saving: boolean;
  onSlugChange: (s: string) => void;
  onSave: (input: SiteBannerInput & { id_banner?: string }) => Promise<void>;
}) {
  const [form, setForm] = useState(banner);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setForm(banner);
  }, [banner]);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const url = await uploadBannerImage(file);
      setForm((f) => ({ ...f, image_url: url }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengunggah gambar.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      className="bg-white border border-[#EAE5E0] rounded-xl p-6 shadow-sm space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!form.image_url?.trim()) {
          alert("Unggah gambar banner terlebih dahulu.");
          return;
        }
        const id = form.id_banner.startsWith("draft-") ? undefined : form.id_banner;
        onSave({
          id_banner: id,
          banner_kind: "category_hero",
          category_slug: slug,
          badge: form.badge,
          title_line1: form.title_line1,
          title_line2: null,
          description: form.description,
          button_text: null,
          button_link: null,
          image_url: form.image_url,
          image_position: form.image_position,
          sort_order: 0,
          is_active: form.is_active,
        });
      }}
    >
      <div>
        <label className="block text-[10px] font-bold uppercase text-[#8E8680] mb-1">Pilih Kategori</label>
        <select className={inputClass} value={slug} onChange={(e) => onSlugChange(e.target.value)}>
          {DEFAULT_CATEGORY_HERO_SLUGS.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <BannerImageUpload
        imageUrl={form.image_url}
        uploading={uploading}
        onFile={(file) => void handleFile(file)}
      />

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase text-[#8E8680] mb-1">Badge</label>
          <input className={inputClass} value={form.badge || ""} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase text-[#8E8680] mb-1">Judul Banner</label>
          <input className={inputClass} value={form.title_line1 || ""} onChange={(e) => setForm({ ...form, title_line1: e.target.value })} required />
        </div>
        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold uppercase text-[#8E8680] mb-1">Deskripsi</label>
          <textarea className={inputClass} rows={3} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase text-[#8E8680] mb-1">Posisi Gambar</label>
          <input
            className={inputClass}
            value={form.image_position || "center center"}
            onChange={(e) => setForm({ ...form, image_position: e.target.value })}
            placeholder="center center atau center 40%"
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm font-semibold text-[#3E3834]">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Aktif
          </label>
        </div>
      </div>

      <button type="submit" disabled={saving} className="px-5 py-2.5 bg-[#16A34A] text-white text-xs font-bold rounded-lg disabled:opacity-60">
        {saving ? "Menyimpan..." : "Simpan Banner Kategori"}
      </button>
    </form>
  );
}
