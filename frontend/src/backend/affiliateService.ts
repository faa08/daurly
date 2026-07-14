import { apiFetch } from "@/lib/api-client";

export interface AffiliateStats {
  saldoAktif: number;
  saldoPending: number;
  totalKlik: number;
  conversions: AffiliateConversion[];
}

export interface AffiliateConversion {
  id_order_item: string;
  nama_produk: string;
  qty: number;
  harga: number;
  komisi: number;
  orderId: string;
  tanggal: string;
  statusOrder: string;
  pembeli: string;
}

export interface PayoutRequest {
  id_penarikan: string;
  id_user: string;
  jumlah: number;
  nama_bank: string;
  no_rek: string;
  atas_nama: string;
  status: "diajukan" | "diproses" | "selesai" | "ditolak";
  catatan_admin?: string | null;
  created_at: string;
  updated_at: string;
}

export const affiliateService = {
  async joinAffiliate(payload: {
    email: string;
    phone: string;
    social: string;
    nik: string;
    ktpName: string;
  }): Promise<{ message: string }> {
    const res = await apiFetch("/api/affiliate/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Gagal mendaftar program affiliate.");
    }
    return data;
  },

  async getAffiliateStats(): Promise<AffiliateStats> {
    const res = await apiFetch("/api/affiliate/stats", {
      method: "GET",
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Gagal mengambil statistik affiliate.");
    }
    return data as AffiliateStats;
  },

  async requestPayout(payload: {
    amount: number;
    namaBank: string;
    noRek: string;
    atasNama: string;
  }): Promise<{ success: boolean; message: string }> {
    const res = await apiFetch("/api/affiliate/payout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Gagal mengajukan penarikan dana.");
    }
    return data;
  },

  async getPayouts(): Promise<PayoutRequest[]> {
    const res = await apiFetch("/api/affiliate/payout", {
      method: "GET",
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Gagal mengambil riwayat penarikan.");
    }
    return data.payouts as PayoutRequest[];
  },
};
