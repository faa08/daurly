"use client";

import React, { useState, useEffect } from "react";
import { adminService } from "@/backend/adminService";
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  ExternalLink,
  Loader2,
  Search,
  Trash2,
} from "lucide-react";

interface AffiliateApplicant {
  id_user: string;
  username: string;
  nama_lengkap: string;
  email: string;
  affiliate_status: "none" | "pending" | "approved" | "rejected";
  affiliate_phone: string;
  affiliate_social: string;
  affiliate_nik: string;
  affiliate_ktp_name: string;
  created_at: string;
  total_clicks?: number;
  total_earned?: number;
  active_balance?: number;
  total_conversions?: number;
}

export default function AdminAffiliatesPage() {
  const [applicants, setApplicants] = useState<AffiliateApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [selectedApplicant, setSelectedApplicant] = useState<AffiliateApplicant | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchApplicants = async () => {
    setLoading(true);
    const data = await adminService.getPendingAffiliates();
    setApplicants(data as AffiliateApplicant[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const handleReview = async (userId: string, approve: boolean) => {
    if (!confirm(`Apakah Anda yakin ingin ${approve ? "menyetujui" : "menolak"} pendaftaran affiliate ini?`)) {
      return;
    }

    setSubmitting(true);
    const ok = await adminService.reviewAffiliate(userId, approve);
    setSubmitting(false);

    if (ok) {
      alert(`Pendaftaran berhasil ${approve ? "disetujui" : "ditolak"}.`);
      setSelectedApplicant(null);
      fetchApplicants();
    } else {
      alert("Gagal memproses persetujuan affiliate.");
    }
  };

  const handleDeactivate = async (userId: string) => {
    if (!confirm("Apakah Anda yakin ingin menonaktifkan akun affiliate ini?")) {
      return;
    }

    setSubmitting(true);
    const ok = await adminService.deactivateAffiliate(userId);
    setSubmitting(false);

    if (ok) {
      alert("Akun affiliate berhasil dinonaktifkan.");
      setSelectedApplicant(null);
      fetchApplicants();
    } else {
      alert("Gagal menonaktifkan akun affiliate.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!selectedApplicant) return;
    if (deleteConfirmText !== "HAPUS") return;
    
    setDeleteLoading(true);
    const ok = await adminService.deleteUserAccount(selectedApplicant.id_user);
    setDeleteLoading(false);

    if (ok) {
      alert("Akun affiliate berhasil dihapus secara permanen.");
      setIsDeleteModalOpen(false);
      setSelectedApplicant(null);
      fetchApplicants();
    } else {
      alert("Gagal menghapus akun affiliate.");
    }
  };

  // Filter applicants based on activeTab and searchQuery
  const filteredApplicants = applicants.filter((item) => {
    const matchesTab = 
      activeTab === "all" || 
      item.affiliate_status === activeTab;
    
    const matchesSearch = 
      item.nama_lengkap?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.affiliate_nik?.includes(searchQuery);

    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: AffiliateApplicant["affiliate_status"]) => {
    switch (status) {
      case "pending":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-600">
            <Clock size={12} />
            Menunggu
          </span>
        );
      case "approved":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-green-50 text-green-600">
            <CheckCircle size={12} />
            Disetujui
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-red-50 text-red-600">
            <XCircle size={12} />
            Ditolak
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-[#F5F3F0] text-secondary">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl font-bold text-on-surface">Verifikasi Partner Affiliate</h2>
          <p className="font-body text-body-md text-[#3E3834] mt-1">
            Tinjau, setujui, atau tolak pendaftaran program kemitraan affiliate Daurly.
          </p>
        </div>
      </header>

      {/* Control Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-[#EAE5E0]">
        {/* Search */}
        <div className="relative flex items-center w-full md:w-80">
          <Search size={16} className="absolute left-3 text-secondary" />
          <input
            type="text"
            placeholder="Cari nama, username, NIK..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-secondary-fixed rounded-lg focus:outline-none focus:border-primary text-xs"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto self-start md:self-auto">
          {(["pending", "approved", "rejected", "all"] as const).map((tab) => {
            const count = applicants.filter(a => tab === "all" || a.affiliate_status === tab).length;
            const tabLabels = {
              pending: "Menunggu",
              approved: "Disetujui",
              rejected: "Ditolak",
              all: "Semua",
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === tab
                    ? "bg-[#16A34A] text-white"
                    : "text-secondary hover:bg-surface"
                }`}
              >
                <span>{tabLabels[tab]}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                  activeTab === tab ? "bg-white/20 text-white" : "bg-[#F5F3F0] text-secondary"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-xl border border-[#EAE5E0] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-primary" size={32} />
            <span className="text-sm font-semibold text-secondary">Memuat data pendaftar...</span>
          </div>
        ) : filteredApplicants.length === 0 ? (
          <div className="text-center py-20 text-secondary space-y-2">
            <Users size={40} className="mx-auto text-secondary/35" />
            <p className="text-sm font-bold">Tidak ada data pendaftaran</p>
            <p className="text-xs text-secondary/60">Tidak ditemukan pendaftaran affiliate pada filter ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF9F6] border-b border-[#EAE5E0] text-secondary font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Tanggal Daftar</th>
                  <th className="px-6 py-4">Nama Pendaftar</th>
                  <th className="px-6 py-4">No. HP / NIK</th>
                  <th className="px-6 py-4 font-mono">Media Sosial</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Performa Link</th>
                  <th className="px-6 py-4">Komisi Bersih</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F3F0]">
                {filteredApplicants.map((applicant) => (
                  <tr key={applicant.id_user} className="hover:bg-surface transition">
                    <td className="px-6 py-4 text-secondary whitespace-nowrap">
                      {applicant.created_at ? new Date(applicant.created_at).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }) : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-on-surface">{applicant.nama_lengkap}</div>
                      <div className="text-[10px] text-secondary">@{applicant.username} • {applicant.email}</div>
                    </td>
                    <td className="px-6 py-4 text-secondary whitespace-nowrap">
                      <div>{applicant.affiliate_phone || "-"}</div>
                      <div className="text-[10px] font-mono text-secondary mt-0.5">{applicant.affiliate_nik || "-"}</div>
                    </td>
                    <td className="px-6 py-4 max-w-[150px] truncate text-primary font-semibold">
                      {applicant.affiliate_social ? (
                        <a 
                          href={applicant.affiliate_social.startsWith("http") ? applicant.affiliate_social : `https://${applicant.affiliate_social}`}
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:underline flex items-center gap-1 inline-flex"
                        >
                          {applicant.affiliate_social}
                          <ExternalLink size={10} />
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(applicant.affiliate_status)}
                    </td>
                    <td className="px-6 py-4 text-secondary whitespace-nowrap">
                      {applicant.affiliate_status === "approved" ? (
                        <div>
                          <span className="font-extrabold text-on-surface">{applicant.total_clicks || 0}</span> klik • <span className="font-extrabold text-on-surface">{applicant.total_conversions || 0}</span> sales
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 text-secondary whitespace-nowrap">
                      {applicant.affiliate_status === "approved" ? (
                        <div className="font-bold text-[#15803D]">
                          Rp {(applicant.total_earned || 0).toLocaleString("id-ID")}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedApplicant(applicant)}
                        className="p-2 text-primary hover:bg-[#F0FDF4] rounded-lg transition inline-flex items-center gap-1.5 font-bold"
                        title="Lihat Detail"
                      >
                        <Eye size={14} />
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Applicant Modal Drawer */}
      {selectedApplicant && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in border border-[#EAE5E0]">
            <header className="flex items-center justify-between px-6 py-4 border-b border-[#F5F3F0]">
              <h3 className="font-headline text-lg font-black text-on-surface">Detail Pendaftar Affiliate</h3>
              <button
                onClick={() => setSelectedApplicant(null)}
                className="p-1 rounded-full text-secondary hover:bg-surface transition"
              >
                <XCircle size={20} className="text-secondary" />
              </button>
            </header>

            <div className="p-6 space-y-6">
              {/* Account profile block */}
              <div className="bg-surface p-4 rounded-xl border border-surface-container space-y-3">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Informasi Akun</span>
                <div className="grid grid-cols-3 text-xs gap-y-1">
                  <span className="text-secondary col-span-1">Nama:</span>
                  <span className="font-bold text-on-surface col-span-2">{selectedApplicant.nama_lengkap}</span>
                  <span className="text-secondary col-span-1">Username:</span>
                  <span className="font-bold text-on-surface col-span-2">@{selectedApplicant.username}</span>
                  <span className="text-secondary col-span-1">Email:</span>
                  <span className="font-bold text-on-surface col-span-2 break-all">{selectedApplicant.email}</span>
                </div>
              </div>

              {/* Performance stats block (Only for approved affiliates) */}
              {selectedApplicant.affiliate_status === "approved" && (
                <div className="bg-green-50/50 p-4 rounded-xl border border-green-100 space-y-3">
                  <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Statistik Kinerja Affiliate</span>
                  <div className="grid grid-cols-2 text-xs gap-y-2 gap-x-4">
                    <div>
                      <div className="text-secondary text-[10px]">Total Klik Link</div>
                      <div className="font-extrabold text-sm text-on-surface">{selectedApplicant.total_clicks || 0} Klik</div>
                    </div>
                    <div>
                      <div className="text-secondary text-[10px]">Total Penjualan</div>
                      <div className="font-extrabold text-sm text-on-surface">{selectedApplicant.total_conversions || 0} Konversi</div>
                    </div>
                    <div>
                      <div className="text-secondary text-[10px]">Total Komisi Bersih</div>
                      <div className="font-extrabold text-sm text-green-700">Rp {(selectedApplicant.total_earned || 0).toLocaleString("id-ID")}</div>
                    </div>
                    <div>
                      <div className="text-secondary text-[10px]">Saldo Aktif Saat Ini</div>
                      <div className="font-extrabold text-sm text-primary">Rp {(selectedApplicant.active_balance || 0).toLocaleString("id-ID")}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Identity & Contact verification details */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Berkas Verifikasi</span>
                
                <div className="space-y-4">
                  <div className="border-b border-[#F5F3F0] pb-2 text-xs">
                    <div className="text-secondary mb-0.5">Nama Lengkap di KTP</div>
                    <div className="font-bold text-on-surface text-sm">{selectedApplicant.affiliate_ktp_name || "-"}</div>
                  </div>
                  
                  <div className="border-b border-[#F5F3F0] pb-2 text-xs">
                    <div className="text-secondary mb-0.5">Nomor NIK KTP</div>
                    <div className="font-bold text-on-surface text-sm font-mono tracking-wider">{selectedApplicant.affiliate_nik || "-"}</div>
                  </div>

                  <div className="border-b border-[#F5F3F0] pb-2 text-xs">
                    <div className="text-secondary mb-0.5">Nomor WhatsApp Aktif</div>
                    <div className="font-bold text-on-surface text-sm">{selectedApplicant.affiliate_phone || "-"}</div>
                  </div>

                  <div className="pb-2 text-xs">
                    <div className="text-secondary mb-0.5">Media Sosial Promosi</div>
                    {selectedApplicant.affiliate_social ? (
                      <a 
                        href={selectedApplicant.affiliate_social.startsWith("http") ? selectedApplicant.affiliate_social : `https://${selectedApplicant.affiliate_social}`}
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="font-bold text-primary text-sm hover:underline flex items-center gap-1.5 mt-0.5"
                      >
                        {selectedApplicant.affiliate_social}
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      "-"
                    )}
                  </div>
                </div>
              </div>

              {/* Warning note */}
              {selectedApplicant.affiliate_status === "pending" && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-[10px] text-emerald-800 leading-normal">
                  Verifikasi wajib dicocokkan dengan kevalidan NIK dan akun media sosial. Klik <strong>Setujui</strong> jika data valid untuk mengaktifkan status affiliate pengguna secara instan.
                </div>
              )}

              {/* Review Actions */}
              {selectedApplicant.affiliate_status === "pending" && (
                <div className="flex gap-3 pt-4 border-t border-[#F5F3F0]">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleReview(selectedApplicant.id_user, false)}
                    className="flex-1 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    Tolak Pendaftaran
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleReview(selectedApplicant.id_user, true)}
                    className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                    Setujui Partner
                  </button>
                </div>
              )}

              {/* Action for Approved (Deactivate Option) */}
              {selectedApplicant.affiliate_status === "approved" && (
                <div className="pt-4 border-t border-[#F5F3F0]">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleDeactivate(selectedApplicant.id_user)}
                    className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    Nonaktifkan Akun Affiliate
                  </button>
                </div>
              )}

              {/* Action for Rejected (Re-approve Option) */}
              {selectedApplicant.affiliate_status === "rejected" && (
                <div className="pt-4 border-t border-[#F5F3F0]">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleReview(selectedApplicant.id_user, true)}
                    className="w-full px-4 py-3 bg-[#15803D] hover:bg-[#166534] text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                    Aktifkan Kembali Partner
                  </button>
                </div>
              )}

              {/* Delete Account Option (Always available at the bottom) */}
              <div className="pt-4 border-t border-[#F5F3F0]">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirmText("");
                    setIsDeleteModalOpen(true);
                  }}
                  className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-sm rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 size={16} />
                  Hapus Akun Affiliate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hapus Akun Affiliate */}
      {isDeleteModalOpen && selectedApplicant && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4 text-left border border-[#EAE5E0] animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-red-600">
              <span className="material-symbols-outlined text-3xl">warning</span>
              <h3 className="font-headline font-bold text-lg text-on-surface">Hapus Akun Affiliate</h3>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs text-[#5C5550] font-semibold leading-relaxed">
                Tindakan ini tidak dapat dibatalkan. Semua saldo komisi, riwayat klik rujukan, dan berkas pendaftaran partner dari <strong>{selectedApplicant.nama_lengkap} (@{selectedApplicant.username})</strong> akan dihapus secara permanen. Akun login pengguna akan tetap aktif.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-secondary uppercase tracking-wider text-[10px]">
                Ketik <span className="text-red-600 font-extrabold">HAPUS</span> untuk mengonfirmasi:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="HAPUS"
                className="w-full px-3 py-2.5 border border-surface-container rounded-lg text-sm focus:outline-none focus:border-red-500 font-bold"
              />
            </div>

            <div className="flex gap-3 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleteLoading}
                className="flex-1 py-2.5 border border-surface-container text-[#5C5550] font-bold rounded-lg hover:bg-surface-container transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "HAPUS" || deleteLoading}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  "Hapus Permanen"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
