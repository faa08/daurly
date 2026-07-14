"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { sellerService, generateStoreEmail } from "@/backend/sellerService";
import { supabase } from "@/backend/supabase";
import AdminFormShell from "@/components/admin/AdminFormShell";
import {
  ADMIN_DRAFT_KEYS,
  clearAdminDraft,
  loadAdminDraft,
  saveAdminDraft,
} from "@/lib/adminDrafts";

export interface StoreDraftData {
  name: string;
  ownerName: string;
  desc: string;
  addr: string;
  phone: string;
  logo: string;
  status: "Aktif" | "Nonaktif";
}

const EMPTY_DRAFT: StoreDraftData = {
  name: "",
  ownerName: "",
  desc: "",
  addr: "",
  phone: "",
  logo: "",
  status: "Aktif",
};

export default function StoreForm({
  mode,
  storeId,
}: {
  mode: "new" | "edit";
  storeId?: string;
}) {
  const router = useRouter();
  const draftKey =
    mode === "new"
      ? ADMIN_DRAFT_KEYS.storeNew
      : ADMIN_DRAFT_KEYS.storeEdit(storeId!);

  const [form, setForm] = useState<StoreDraftData>(EMPTY_DRAFT);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persistDraft = useCallback(() => {
    const hasContent =
      form.name.trim() ||
      form.ownerName.trim() ||
      form.desc.trim() ||
      form.addr.trim() ||
      form.phone.trim() ||
      form.logo;
    if (!hasContent) return;
    saveAdminDraft(draftKey, form);
    setDraftSavedAt(Date.now());
  }, [draftKey, form]);

  const goBack = useCallback(() => {
    persistDraft();
    router.push("/admin/stores");
  }, [persistDraft, router]);

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (!ready) return;
    saveTimer.current = setTimeout(() => persistDraft(), 1500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [form, ready, persistDraft]);

  useEffect(() => {
    return () => {
      persistDraft();
    };
  }, [persistDraft]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const draft = loadAdminDraft<StoreDraftData>(draftKey);
      if (draft) {
        const { savedAt, ...data } = draft;
        setForm(data);
        setDraftSavedAt(savedAt);
        setReady(true);
        return;
      }

      if (mode === "edit" && storeId) {
        const sellers = await sellerService.getSellers();
        const seller = sellers.find((s) => s.id_seller === storeId);
        if (!cancelled && seller) {
          setForm({
            name: seller.nm_store,
            ownerName: seller.users?.nama_lengkap || "",
            desc: seller.deskripsi || "",
            addr: seller.addr || "",
            phone: seller.no_telp || "",
            logo: seller.logo_toko || "",
            status: seller.is_verified ? "Aktif" : "Nonaktif",
          });
        }
      }

      if (!cancelled) setReady(true);
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [draftKey, mode, storeId]);

  const uploadLogo = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran gambar logo terlalu besar! Maksimal adalah 2MB.");
      return;
    }

    setUploadProgress(0);

    const fileExt = file.name.split(".").pop();
    const fileName = `logo-${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
    const filePath = `store-logos/${fileName}`;

    try {
      setUploadProgress(20);
      const { error } = await supabase.storage.from("products").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;
      setUploadProgress(80);

      const { data: publicUrlData } = supabase.storage.from("products").getPublicUrl(filePath);
      if (publicUrlData?.publicUrl) {
        setForm((prev) => ({ ...prev, logo: publicUrlData.publicUrl }));
        setUploadProgress(100);
      } else {
        throw new Error("Gagal mendapatkan public URL.");
      }
    } catch (err) {
      console.warn("Gagal mengunggah ke Supabase Storage, menggunakan mode fallback base64...", err);
      setUploadProgress(50);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setForm((prev) => ({ ...prev, logo: event.target!.result as string }));
          setUploadProgress(100);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      await uploadLogo(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!form.name.trim() || !form.ownerName.trim()) {
      alert("Nama Toko dan Nama Pemilik wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "new") {
        const generatedEmail = generateStoreEmail(form.name.trim());
        const newStore = await sellerService.createStore(
          form.name.trim(),
          generatedEmail,
          "",
          "",
          "Indonesia",
          "",
          "",
          "",
          true,
          form.ownerName.trim(),
          form.logo || undefined
        );

        if (newStore) {
          clearAdminDraft(draftKey);
          alert(`Toko ${form.name} berhasil ditambahkan dan langsung aktif!`);
          router.push("/admin/stores");
        } else {
          alert("Gagal menambahkan toko. Periksa koneksi database atau hak akses Supabase.");
        }
      } else if (storeId) {
        const success = await sellerService.updateSeller(storeId, {
          nm_store: form.name.trim(),
          nama_pemilik: form.ownerName.trim(),
          deskripsi: form.desc.trim(),
          addr: form.addr.trim(),
          no_telp: form.phone.trim(),
          logo_toko: form.logo || undefined,
          is_verified: form.status === "Aktif",
        });

        if (success) {
          clearAdminDraft(draftKey);
          alert(`Toko ${form.name} berhasil diperbarui!`);
          router.push("/admin/stores");
        } else {
          alert("Gagal memperbarui data toko.");
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menyimpan toko.";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const set = <K extends keyof StoreDraftData>(key: K, value: StoreDraftData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  if (!ready) {
    return (
      <div className="py-16 text-center text-sm text-[#8E8680]">Memuat form...</div>
    );
  }

  return (
    <AdminFormShell
      title={mode === "new" ? "Tambah Toko Baru" : "Edit Toko"}
      subtitle={
        mode === "new"
          ? "Toko baru akan langsung aktif setelah disimpan."
          : "Perbarui informasi toko mitra Daur Ulang."
      }
      backHref="/admin/stores"
      onBack={goBack}
      draftSavedAt={draftSavedAt}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5 font-semibold text-xs text-[#5C5550]">
        <div className="space-y-1.5">
          <label className="block text-[11px] uppercase tracking-wider text-[#8E8680]">
            Nama Toko <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="contoh: Griya Keramik Kasongan"
            className="w-full px-3.5 py-2.5 border border-[#D5CFC9] rounded-lg bg-[#F5F3F0] focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A] text-xs text-[#1F1B18]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] uppercase tracking-wider text-[#8E8680]">
            Nama Pemilik Toko <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.ownerName}
            onChange={(e) => set("ownerName", e.target.value)}
            placeholder="Nama lengkap pemilik toko"
            className="w-full px-3.5 py-2.5 border border-[#D5CFC9] rounded-lg bg-[#F5F3F0] focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A] text-xs text-[#1F1B18]"
          />
        </div>

        {mode === "edit" && (
          <>
            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase tracking-wider text-[#8E8680]">Deskripsi</label>
              <textarea
                value={form.desc}
                onChange={(e) => set("desc", e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 border border-[#D5CFC9] rounded-lg bg-[#F5F3F0] focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A] text-xs text-[#1F1B18] resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase tracking-wider text-[#8E8680]">Alamat</label>
              <input
                type="text"
                value={form.addr}
                onChange={(e) => set("addr", e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#D5CFC9] rounded-lg bg-[#F5F3F0] focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A] text-xs text-[#1F1B18]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase tracking-wider text-[#8E8680]">No. Telepon</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#D5CFC9] rounded-lg bg-[#F5F3F0] focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A] text-xs text-[#1F1B18]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase tracking-wider text-[#8E8680]">Status Toko</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value as "Aktif" | "Nonaktif")}
                className="w-full px-3.5 py-2.5 border border-[#D5CFC9] rounded-lg bg-[#F5F3F0] focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A] text-xs text-[#1F1B18]"
              >
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
          </>
        )}

        <div className="space-y-2">
          <label className="block text-[11px] uppercase tracking-wider text-[#8E8680]">
            Logo Toko <span className="text-[#8E8680] font-normal normal-case">(opsional)</span>
          </label>
          {form.logo && (
            <div className="flex items-center gap-3 p-3 bg-[#F5F3F0] rounded-lg border border-[#EAE5E0]">
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#D5CFC9] flex-shrink-0">
                <img src={form.logo} alt="Preview logo" className="w-full h-full object-cover" />
              </div>
              <button
                type="button"
                onClick={() => set("logo", "")}
                className="text-[#8E8680] hover:text-red-500 transition"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          )}
          <label className="flex items-center justify-center gap-2 w-full h-10 border-2 border-dashed border-[#D5CFC9] rounded-lg cursor-pointer hover:border-[#16A34A] hover:bg-blue-50/30 transition text-[#8E8680] hover:text-[#16A34A]">
            <span className="material-symbols-outlined text-[18px]">upload</span>
            <span className="text-xs font-semibold">
              {uploadProgress !== null && uploadProgress < 100
                ? `Mengunggah... ${uploadProgress}%`
                : "Klik untuk upload gambar"}
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </label>
        </div>

        {mode === "new" && (
          <p className="text-[10px] text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            Toko baru akan langsung aktif setelah ditambahkan.
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2 border-t border-[#EAE5E0]">
          <button
            type="button"
            onClick={goBack}
            className="px-4 py-2 border border-[#D5CFC9] text-[#5C5550] hover:bg-[#F5F3F0] text-xs font-bold rounded-lg transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 bg-[#16A34A] text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition flex items-center gap-1.5 disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[16px]">
              {mode === "new" ? "add" : "save"}
            </span>
            {isSubmitting ? "Menyimpan..." : mode === "new" ? "Tambah Toko" : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </AdminFormShell>
  );
}
