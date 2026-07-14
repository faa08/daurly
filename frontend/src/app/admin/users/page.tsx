"use client";

import React, { useState, useEffect } from "react";
import { adminService } from "@/backend/adminService";
import { DEFAULT_AVATAR, resolveAvatarUrl } from "@/lib/avatar";
import { 
  Users, 
  Search, 
  Loader2, 
  Eye, 
  XCircle, 
  Shield, 
  User as UserIcon, 
  Store,
  Calendar,
  Phone,
  Mail,
  UserCheck,
  Trash2,
} from "lucide-react";

interface UserProfile {
  id_user: string;
  username: string;
  nama_lengkap: string;
  email: string;
  no_telp: string;
  avatar: string;
  role: "customer" | "seller" | "admin" | "tester";
  created_at: string;
  jenis_kelamin?: string;
  tanggal_lahir?: string;
  is_affiliate?: boolean;
  is_suspended?: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "customer" | "seller" | "admin" | "tester">("all");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [updatingRole, setUpdatingRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"customer" | "seller" | "admin" | "tester">("customer");

  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [suspendConfirmText, setSuspendConfirmText] = useState("");
  const [suspendLoading, setSuspendLoading] = useState(false);

  const [isDeleteTesterModalOpen, setIsDeleteTesterModalOpen] = useState(false);
  const [deleteTesterConfirmText, setDeleteTesterConfirmText] = useState("");
  const [deleteTesterLoading, setDeleteTesterLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const data = await adminService.getUsers();
    setUsers(data as UserProfile[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async () => {
    if (!selectedUser) return;
    if (selectedUser.role === selectedRole) {
      alert("Role tidak berubah.");
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin mengubah role ${selectedUser.nama_lengkap} menjadi ${selectedRole}?`)) {
      return;
    }

    setUpdatingRole(true);
    const ok = await adminService.updateUserRole(selectedUser.id_user, selectedRole);
    setUpdatingRole(false);

    if (ok) {
      alert("Role pengguna berhasil diperbarui!");
      setSelectedUser({ ...selectedUser, role: selectedRole });
      fetchUsers();
    } else {
      alert("Gagal memperbarui role pengguna.");
    }
  };

  const handleSuspendToggle = async (suspend: boolean) => {
    if (!selectedUser) return;
    
    if (suspend) {
      setSuspendConfirmText("");
      setIsSuspendModalOpen(true);
    } else {
      if (!confirm(`Apakah Anda yakin ingin mengaktifkan kembali akun ${selectedUser.nama_lengkap}?`)) {
        return;
      }
      
      setSuspendLoading(true);
      const ok = await adminService.suspendUserAccount(selectedUser.id_user, false);
      setSuspendLoading(false);

      if (ok) {
        alert("Akun pengguna berhasil diaktifkan kembali.");
        setSelectedUser({ ...selectedUser, is_suspended: false });
        fetchUsers();
      } else {
        alert("Gagal mengaktifkan akun pengguna.");
      }
    }
  };

  const confirmSuspendAccount = async () => {
    if (!selectedUser || suspendConfirmText !== "SUSPEND") return;

    setSuspendLoading(true);
    const ok = await adminService.suspendUserAccount(selectedUser.id_user, true);
    setSuspendLoading(false);

    if (ok) {
      alert("Akun pengguna berhasil ditangguhkan (suspended).");
      setIsSuspendModalOpen(false);
      setSelectedUser({ ...selectedUser, is_suspended: true });
      fetchUsers();
    } else {
      alert("Gagal menangguhkan akun pengguna.");
    }
  };

  const handleDeleteTesterAccount = async () => {
    if (!selectedUser || deleteTesterConfirmText !== "HAPUS") return;

    setDeleteTesterLoading(true);
    const ok = await adminService.deleteTesterAccount(selectedUser.id_user);
    setDeleteTesterLoading(false);

    if (ok) {
      alert("Akun tester berhasil dihapus secara permanen dari Supabase dan database.");
      setIsDeleteTesterModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } else {
      alert("Gagal menghapus akun tester.");
    }
  };

  // Filter users based on roleFilter and searchQuery
  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      u.nama_lengkap?.toLowerCase().includes(query) ||
      u.username?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query) ||
      u.no_telp?.includes(query);

    return matchesRole && matchesSearch;
  });

  const getRoleBadge = (role: UserProfile["role"]) => {
    switch (role) {
      case "admin":
        return (
          <span className="flex items-center gap-1 inline-flex px-2.5 py-1 text-xs font-bold rounded-full bg-red-50 text-red-600 border border-red-100">
            <Shield size={12} />
            Admin
          </span>
        );
      case "seller":
        return (
          <span className="flex items-center gap-1 inline-flex px-2.5 py-1 text-xs font-bold rounded-full bg-purple-50 text-purple-600 border border-purple-100">
            <Store size={12} />
            Seller
          </span>
        );
      case "tester":
        return (
          <span className="flex items-center gap-1 inline-flex px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
            <UserIcon size={12} className="text-emerald-500" />
            Tester
          </span>
        );
      case "customer":
      default:
        return (
          <span className="flex items-center gap-1 inline-flex px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 text-primary border border-blue-100">
            <UserIcon size={12} />
            Customer
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h2 className="font-headline text-3xl font-bold text-on-surface">Manajemen Pengguna</h2>
        <p className="font-body text-body-md text-[#3E3834] mt-1">
          Tinjau detail informasi pengguna, kelola peran (role), dan pantau seluruh member Daurly.
        </p>
      </header>

      {/* Control Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-[#EAE5E0]">
        {/* Search */}
        <div className="relative flex items-center w-full md:w-80">
          <Search size={16} className="absolute left-3 text-secondary" />
          <input
            type="text"
            placeholder="Cari nama, username, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-secondary-fixed rounded-lg focus:outline-none focus:border-primary text-xs"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto self-start md:self-auto">
          {(["all", "customer", "seller", "admin", "tester"] as const).map((tab) => {
            const count = users.filter(u => tab === "all" || u.role === tab).length;
            const tabLabels = {
              all: "Semua",
              customer: "Customer",
              seller: "Seller",
              admin: "Admin",
              tester: "Tester",
            };
            return (
              <button
                key={tab}
                onClick={() => setRoleFilter(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  roleFilter === tab
                    ? "bg-[#16A34A] text-white"
                    : "text-[#3E3834] hover:bg-surface"
                }`}
              >
                <span>{tabLabels[tab]}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                  roleFilter === tab ? "bg-white/20 text-white" : "bg-[#F5F3F0] text-[#5C5550]"
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
            <span className="text-sm font-semibold text-secondary">Memuat data pengguna...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20 text-secondary space-y-2">
            <Users size={40} className="mx-auto text-secondary/35" />
            <p className="text-sm font-bold">Tidak ada data pengguna</p>
            <p className="text-xs text-secondary/60">Tidak ditemukan pengguna pada kriteria filter ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF9F6] border-b border-[#EAE5E0] text-secondary font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Nama Lengkap</th>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Email / No. HP</th>
                  <th className="px-6 py-4">Peran (Role)</th>
                  <th className="px-6 py-4">Tanggal Bergabung</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F3F0]">
                {filteredUsers.map((user) => (
                  <tr key={user.id_user} className="hover:bg-surface transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-surface-container-high bg-[#E8E8E8] shrink-0">
                          <img
                            src={resolveAvatarUrl(user.avatar)}
                            alt={user.nama_lengkap}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = DEFAULT_AVATAR;
                            }}
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-on-surface">{user.nama_lengkap}</span>
                          {user.is_suspended && (
                            <span className="inline-block mt-0.5 text-[9px] font-black text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded uppercase w-max tracking-wider">
                              Suspended
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-secondary font-semibold whitespace-nowrap">
                      @{user.username}
                    </td>
                    <td className="px-6 py-4 text-secondary whitespace-nowrap">
                      <div>{user.email}</div>
                      <div className="text-[10px] mt-0.5">{user.no_telp || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 text-secondary whitespace-nowrap">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      }) : "-"}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setSelectedRole(user.role);
                        }}
                        className="p-2 text-primary hover:bg-[#F0FDF4] rounded-lg transition inline-flex items-center gap-1.5 font-bold cursor-pointer"
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

      {/* User Details Drawer Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-[#EAE5E0] animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <header className="flex items-center justify-between px-6 py-4 border-b border-[#F5F3F0] shrink-0">
              <h3 className="font-headline text-lg font-black text-on-surface">Detail Pengguna</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-full text-secondary hover:bg-surface transition cursor-pointer"
              >
                <XCircle size={20} className="text-secondary" />
              </button>
            </header>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Profile Card Info */}
              <div className="flex flex-col items-center gap-3 pb-4 border-b border-[#F5F3F0]">
                <div className="w-20 h-20 rounded-full overflow-hidden border border-surface-container bg-[#E8E8E8] shadow-sm">
                  <img
                    src={resolveAvatarUrl(selectedUser.avatar)}
                    alt={selectedUser.nama_lengkap}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_AVATAR;
                    }}
                  />
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-on-surface text-base">{selectedUser.nama_lengkap}</h4>
                  <p className="text-xs text-secondary mt-0.5">@{selectedUser.username}</p>
                  <div className="mt-2">{getRoleBadge(selectedUser.role)}</div>
                </div>
              </div>

              {/* Detail list info */}
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">Detail Informasi</span>
                
                <div className="space-y-3.5 text-xs">
                  <div className="flex items-start gap-3">
                    <Mail size={16} className="text-secondary shrink-0 mt-0.5" />
                    <div>
                      <div className="text-secondary text-[10px]">Alamat Email</div>
                      <div className="font-bold text-on-surface break-all">{selectedUser.email}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone size={16} className="text-secondary shrink-0 mt-0.5" />
                    <div>
                      <div className="text-secondary text-[10px]">Nomor WhatsApp / Telp</div>
                      <div className="font-bold text-on-surface">{selectedUser.no_telp || "Belum ditambahkan"}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-secondary text-[10px]">Jenis Kelamin</div>
                      <div className="font-bold text-on-surface mt-0.5">{selectedUser.jenis_kelamin || "Belum diisi"}</div>
                    </div>
                    <div>
                      <div className="text-secondary text-[10px]">Tanggal Lahir</div>
                      <div className="font-bold text-on-surface mt-0.5">
                        {selectedUser.tanggal_lahir ? new Date(selectedUser.tanggal_lahir).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }) : "Belum diisi"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar size={16} className="text-secondary shrink-0 mt-0.5" />
                    <div>
                      <div className="text-secondary text-[10px]">Bergabung Sejak</div>
                      <div className="font-bold text-on-surface">
                        {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }) + " WIB" : "-"}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-secondary text-[10px]">Kemitraan Affiliate</div>
                      <div className="font-bold mt-1 inline-flex">
                        {selectedUser.is_affiliate ? (
                          <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 text-[10px] border border-green-200 font-extrabold uppercase">Aktif</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-[#F5F3F0] text-secondary text-[10px] border border-surface-container-high font-extrabold uppercase">Tidak Aktif</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-secondary text-[10px]">Status Akun</div>
                      <div className="font-bold mt-1 inline-flex">
                        {selectedUser.is_suspended ? (
                          <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 text-[10px] border border-red-200 font-extrabold uppercase animate-pulse">Ditangguhkan</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 text-[10px] border border-green-200 font-extrabold uppercase">Aktif</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Role Management Form */}
              <div className="pt-4 border-t border-[#F5F3F0] space-y-3">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">Ubah Peran (Role)</span>
                
                <div className="flex gap-2">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as any)}
                    className="flex-1 px-3 py-2 border border-surface-container rounded-lg text-xs focus:outline-none focus:border-primary font-semibold"
                  >
                    <option value="customer">Customer</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                    <option value="tester">Tester</option>
                  </select>
                  <button
                    onClick={handleRoleChange}
                    disabled={updatingRole || selectedRole === selectedUser.role}
                    className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-lg hover:brightness-95 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    {updatingRole ? <Loader2 size={12} className="animate-spin" /> : <UserCheck size={12} />}
                    Simpan Peran
                  </button>
                </div>
              </div>

              {/* Account Suspension Form */}
              <div className="pt-4 border-t border-[#F5F3F0] space-y-3">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">Kontrol Penangguhan Akun</span>
                {selectedUser.is_suspended ? (
                  <button
                    type="button"
                    onClick={() => handleSuspendToggle(false)}
                    disabled={suspendLoading}
                    className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 font-semibold"
                  >
                    {suspendLoading ? <Loader2 size={12} className="animate-spin" /> : null}
                    Aktifkan Kembali Akun
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSuspendToggle(true)}
                    disabled={suspendLoading}
                    className="w-full px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 font-semibold"
                  >
                    {suspendLoading ? <Loader2 size={12} className="animate-spin" /> : null}
                    Suspend Akun Pengguna
                  </button>
                )}
              </div>
              {/* Account Purge for Tester */}
              {selectedUser.role === "tester" && (
                <div className="pt-4 border-t border-[#F5F3F0] space-y-3">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">Kontrol Akun Tester</span>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteTesterConfirmText("");
                      setIsDeleteTesterModalOpen(true);
                    }}
                    className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer font-semibold"
                  >
                    <Trash2 size={12} />
                    Hapus Akun Tester
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Hapus Akun Tester */}
      {isDeleteTesterModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4 text-left border border-[#EAE5E0] animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600">
              <span className="material-symbols-outlined text-3xl">warning</span>
              <h3 className="font-headline font-bold text-lg text-on-surface">Hapus Akun Tester</h3>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs text-[#5C5550] font-semibold leading-relaxed">
                Tindakan ini tidak dapat dibatalkan. Akun tester <strong>{selectedUser.nama_lengkap} (@{selectedUser.username})</strong> akan dihapus secara permanen dari database dan Supabase Auth.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-secondary uppercase tracking-wider text-[10px]">
                Ketik <span className="text-red-600 font-extrabold">HAPUS</span> untuk mengonfirmasi:
              </label>
              <input
                type="text"
                value={deleteTesterConfirmText}
                onChange={(e) => setDeleteTesterConfirmText(e.target.value)}
                placeholder="HAPUS"
                className="w-full px-3 py-2.5 border border-surface-container rounded-lg text-sm focus:outline-none focus:border-red-500 font-bold"
              />
            </div>

            <div className="flex gap-3 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setIsDeleteTesterModalOpen(false)}
                disabled={deleteTesterLoading}
                className="flex-1 py-2.5 border border-surface-container text-[#5C5550] font-bold rounded-lg hover:bg-surface-container transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteTesterAccount}
                disabled={deleteTesterConfirmText !== "HAPUS" || deleteTesterLoading}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {deleteTesterLoading ? (
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

      {/* Modal Suspend Akun */}
      {isSuspendModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4 text-left border border-[#EAE5E0] animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600">
              <span className="material-symbols-outlined text-3xl">warning</span>
              <h3 className="font-headline font-bold text-lg text-on-surface">Konfirmasi Suspend Akun</h3>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs text-[#5C5550] font-semibold leading-relaxed">
                Tindakan ini akan menangguhkan akun <strong>{selectedUser.nama_lengkap} (@{selectedUser.username})</strong>. Pengguna akan segera dikeluarkan dari sesi login aktif dan diblokir dari seluruh akses platform Daurly.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-secondary uppercase tracking-wider text-[10px]">
                Ketik <span className="text-red-600 font-extrabold">SUSPEND</span> untuk mengonfirmasi:
              </label>
              <input
                type="text"
                value={suspendConfirmText}
                onChange={(e) => setSuspendConfirmText(e.target.value)}
                placeholder="SUSPEND"
                className="w-full px-3 py-2.5 border border-surface-container rounded-lg text-sm focus:outline-none focus:border-red-500 font-bold"
              />
            </div>

            <div className="flex gap-3 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setIsSuspendModalOpen(false)}
                disabled={suspendLoading}
                className="flex-1 py-2.5 border border-surface-container text-[#5C5550] font-bold rounded-lg hover:bg-surface-container transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmSuspendAccount}
                disabled={suspendConfirmText !== "SUSPEND" || suspendLoading}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {suspendLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Menangguhkan...
                  </>
                ) : (
                  "Suspend Akun"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
