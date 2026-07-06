"use client";

import React, { useState, useEffect, useRef } from "react";
import { authService } from "@/backend/authService";
import { DEFAULT_AVATAR, resolveAvatarUrl } from "@/lib/avatar";

export default function CustomerProfilePage() {
  const [user, setUser] = useState<ReturnType<typeof authService.getCurrentUser>>(null);
  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string>(DEFAULT_AVATAR);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setUsername(currentUser.username || "");
      setFullname(currentUser.nama_lengkap || "");
      setEmail(currentUser.email || "");
      setGender(currentUser.jenis_kelamin || "");
      setBirthdate(currentUser.tanggal_lahir || "");
      setAvatarUrl(resolveAvatarUrl(currentUser.avatar));
    }
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 1 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 1 MB.");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setAvatarUrl(localPreview);
    setAvatarUploading(true);

    try {
      const uploadedUrl = await authService.uploadAvatar(file, user.id_user);
      setAvatarUrl(uploadedUrl);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengunggah foto profil.");
      setAvatarUrl(resolveAvatarUrl(user.avatar));
    } finally {
      setAvatarUploading(false);
      URL.revokeObjectURL(localPreview);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || avatarUploading) return;

    setSaving(true);
    const success = await authService.updateProfile(user.id_user, fullname, user.no_telp || "", {
      username,
      avatar: avatarUrl,
    });
    setSaving(false);

    if (success) {
      const updatedUser = authService.getCurrentUser();
      setUser(updatedUser);
      if (updatedUser) setAvatarUrl(resolveAvatarUrl(updatedUser.avatar));
      alert("Profil berhasil diperbarui!");
    } else {
      alert("Gagal menyimpan profil. Coba lagi.");
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-center text-secondary text-sm">
        Loading profil...
      </div>
    );
  }

  const maskedEmail = email.replace(
    /^(.{1})(.*)(@.*)$/,
    (_, first, _middle, domain) => `${first}.${"*".repeat(8)}${domain}`
  );

  return (
    <div className="bg-white border border-surface-container rounded-xl shadow-sm">
      <div className="px-8 pt-8 pb-4 border-b border-surface-container">
        <h2 className="font-headline font-bold text-xl text-on-surface">Profil Saya</h2>
        <p className="text-sm text-secondary mt-0.5">
          Kelola informasi profil Anda untuk mengontrol, melindungi dan mengamankan akun
        </p>
      </div>

      <form onSubmit={handleSave}>
        <div className="flex flex-col-reverse md:flex-row">
          <div className="flex-grow px-6 md:px-8 py-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-start gap-1.5 md:gap-4">
              <label className="w-full md:w-32 md:text-right text-sm text-on-surface md:pt-2 shrink-0">
                Username
              </label>
              <div className="flex-1 w-full space-y-1">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full max-w-sm px-3 py-2 border border-surface-container rounded text-sm text-on-surface focus:outline-none focus:border-primary"
                />
                <p className="text-xs text-secondary">Username hanya dapat diubah satu (1) kali.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-1.5 md:gap-4">
              <label className="w-full md:w-32 md:text-right text-sm text-on-surface shrink-0">Nama</label>
              <input
                type="text"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className="w-full max-w-sm px-3 py-2 border border-surface-container rounded text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-1.5 md:gap-4">
              <label className="w-full md:w-32 md:text-right text-sm text-on-surface shrink-0">Email</label>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-on-surface">{maskedEmail}</span>
                <button type="button" className="text-primary text-sm hover:underline font-medium">
                  Ubah
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-1.5 md:gap-4">
              <label className="w-full md:w-32 md:text-right text-sm text-on-surface shrink-0">Jenis Kelamin</label>
              <div className="flex flex-wrap items-center gap-4 text-sm text-on-surface">
                {["Laki-laki", "Perempuan", "Lainnya"].map((opt) => (
                  <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value={opt}
                      checked={gender === opt}
                      onChange={() => setGender(opt)}
                      className="accent-primary"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-1.5 md:gap-4">
              <label className="w-full md:w-32 md:text-right text-sm text-on-surface shrink-0 flex items-center md:justify-end gap-1">
                Tanggal lahir
                <span
                  className="material-symbols-outlined text-[14px] text-secondary cursor-help"
                  title="Tanggal lahir tidak dapat dilihat publik"
                >
                  help
                </span>
              </label>
              <div className="flex items-center gap-2">
                {birthdate ? (
                  <span className="text-sm text-on-surface">{birthdate}</span>
                ) : (
                  <span className="text-sm text-on-surface">–</span>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-1.5 md:gap-4 pt-2">
              <div className="hidden md:block w-32 shrink-0" />
              <button
                type="submit"
                disabled={saving || avatarUploading}
                className="w-full md:w-auto px-8 py-2.5 bg-primary text-white font-semibold text-sm rounded hover:brightness-95 transition disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>

          <div className="hidden md:block w-px bg-surface-container my-6" />

          <div className="flex flex-col items-center justify-start px-6 md:px-10 py-6 md:py-10 gap-4 border-b border-surface-container md:border-b-0 w-full md:w-auto">
            <div className="w-24 h-24 rounded-full overflow-hidden border border-surface-container bg-[#E8E8E8] flex items-center justify-center relative">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_AVATAR;
                }}
              />
              {avatarUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">Upload...</span>
                </div>
              )}
            </div>

            <input
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="px-5 py-2 border border-surface-container rounded text-sm text-on-surface hover:bg-surface-container/50 transition disabled:opacity-60"
            >
              {avatarUploading ? "Mengunggah..." : "Pilih Gambar"}
            </button>

            <div className="text-center text-xs text-secondary space-y-0.5">
              <p>Ukuran gambar: maks. 1 MB</p>
              <p>Format gambar: .JPEG, .PNG</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
