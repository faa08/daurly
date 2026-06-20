"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  ChevronDown,
  Check,
  Tag,
  ShoppingBag,
  CreditCard,
  Phone,
  User,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Mock products in the order
const ORDER_ITEMS = [
  {
    id: 1,
    name: "Tas Rotan Artisan 'Lestari'",
    quantity: 1,
    weight: 800, // gr
    price: 350000,
    image: "/product-dompet.png", // using available rotan/leather product image
  },
  {
    id: 2,
    name: "Paket Cokelat Artisan",
    quantity: 2,
    weight: 400, // gr
    price: 120000,
    image: "/product-kopi.png", // using available foodie product image
  },
];

// Shipping methods list
const SHIPPING_METHODS = [
  { id: "jne-reg", name: "JNE Regular (Rp 18.000) - Estimasi 2-3 hari", cost: 18000 },
  { id: "jnt-reg", name: "J&T Express (Rp 15.000) - Estimasi 2-4 hari", cost: 15000 },
  { id: "sicepat-gokil", name: "Sicepat Gokil (Rp 12.000) - Estimasi 3-5 hari", cost: 12000 },
  { id: "gosend-instant", name: "GoSend Instant (Rp 25.000) - Estimasi 3 jam", cost: 25000 },
];

// Payment methods list
const PAYMENT_METHODS = [
  {
    id: "bca",
    name: "BCA Virtual Account",
    desc: "Otomatis Terverifikasi",
  },
  {
    id: "gopay",
    name: "GoPay",
    desc: "Saldo atau PayLater",
  },
  {
    id: "shopeepay",
    name: "ShopeePay",
    desc: "Konfirmasi di Aplikasi",
  },
  {
    id: "cc",
    name: "Kartu Kredit",
    desc: "Visa / Mastercard / JCB",
  },
];

export default function CheckoutPage() {
  // Address State
  const [address, setAddress] = useState({
    name: "Budi Santoso (Utama)",
    phone: "6281234567890",
    details: "Jl. Sudirman No. 123, Kebayoran Baru, Jakarta Selatan, DKI Jakarta, 12190",
  });
  const [isEditAddressOpen, setIsEditAddressOpen] = useState(false);
  const [tempAddress, setTempAddress] = useState({ ...address });

  // Shipping & Payment State
  const [selectedShipping, setSelectedShipping] = useState(SHIPPING_METHODS[0]);
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS[0].id);

  // Voucher State
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherError, setVoucherError] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number } | null>(null);

  // checkout status
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Calculate totals
  const totalItemPrice = ORDER_ITEMS.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalWeight = ORDER_ITEMS.reduce((sum, item) => sum + item.weight * item.quantity, 0) / 1000; // in kg
  const shippingCost = selectedShipping.cost;
  const serviceFee = 2000;
  
  // Starting base discount is Rp 25.000 as per mockup. If voucher applies, we increase it.
  const baseDiscount = 25000;
  const voucherDiscount = appliedVoucher ? appliedVoucher.discount : 0;
  const totalDiscount = baseDiscount + voucherDiscount;

  const totalBill = totalItemPrice + shippingCost + serviceFee - totalDiscount;

  // Handle Voucher Submit
  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    setVoucherError("");

    const code = voucherCode.trim().toUpperCase();
    if (!code) return;

    if (code === "LOKALBANGGA") {
      // 10% discount on total items (Rp 590,000 * 10% = Rp 59,000)
      const discountAmount = Math.round(totalItemPrice * 0.1);
      setAppliedVoucher({ code, discount: discountAmount });
      setVoucherCode("");
    } else {
      setVoucherError("Voucher tidak valid. Coba LOKALBANGGA");
    }
  };

  // Handle Address Save
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setAddress({ ...tempAddress });
    setIsEditAddressOpen(false);
  };

  // Handle Payment Submit
  const handlePayNow = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 1500); // simulate network delay
  };

  return (
    <>
      <Navbar />

      <main style={{ background: "#FCFCFA", minHeight: "85vh", padding: "40px 0 60px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#1F1B18", marginBottom: 24 }}>
            Checkout
          </h1>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 380px",
            gap: 28,
            alignItems: "start",
          }}>

            {/* LEFT COLUMN */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              {/* 1. SHIPPING ADDRESS */}
              <div style={{
                background: "white",
                border: "1px solid #EAE5E0",
                borderRadius: 12,
                padding: 24,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontSize: "0.8125rem", fontWeight: 800, color: "#8E8680", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    Alamat Pengiriman
                  </h3>
                  <button 
                    onClick={() => {
                      setTempAddress({ ...address });
                      setIsEditAddressOpen(true);
                    }}
                    style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#1D4ED8", border: "none", cursor: "pointer", background: "none" }}
                  >
                    Ubah
                  </button>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ color: "#1D4ED8", marginTop: 2 }}>
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p style={{ fontSize: "0.875rem", fontWeight: 800, color: "#1F1B18", marginBottom: 4 }}>
                      {address.name} <span style={{ fontWeight: 500, color: "#5C5550" }}>({address.phone})</span>
                    </p>
                    <p style={{ fontSize: "0.8125rem", color: "#5C5550", lineHeight: 1.5 }}>
                      {address.details}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. ORDER DETAILS */}
              <div style={{
                background: "white",
                border: "1px solid #EAE5E0",
                borderRadius: 12,
                padding: 24,
              }}>
                <h3 style={{ fontSize: "0.8125rem", fontWeight: 800, color: "#8E8680", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 16 }}>
                  Detail Pesanan
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {ORDER_ITEMS.map((item) => (
                    <div key={item.id} style={{ display: "flex", gap: 16, alignItems: "center" }}>
                      <div style={{ position: "relative", width: 64, height: 64, borderRadius: 8, overflow: "hidden", background: "#F8F6F4", border: "1px solid #EAE5E0" }}>
                        <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: "0.875rem", fontWeight: 800, color: "#1F1B18", marginBottom: 2 }}>
                          {item.name}
                        </h4>
                        <p style={{ fontSize: "0.75rem", color: "#8E8680", marginBottom: 2 }}>
                          {item.quantity} Barang ({item.weight * item.quantity} gr)
                        </p>
                        <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#1D4ED8" }}>
                          Rp {item.price.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ height: 1, background: "#EAE5E0", margin: "16px 0" }} />

                <div style={{ display: "flex", justifyContent: "flex-end", fontSize: "0.8125rem", color: "#5C5550" }}>
                  <span>Subtotal: <strong style={{ color: "#1F1B18", fontWeight: 700 }}>Rp {totalItemPrice.toLocaleString("id-ID")}</strong></span>
                </div>
              </div>

              {/* 3. SHIPPING METHOD */}
              <div style={{
                background: "white",
                border: "1px solid #EAE5E0",
                borderRadius: 12,
                padding: 24,
              }}>
                <h3 style={{ fontSize: "0.8125rem", fontWeight: 800, color: "#8E8680", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 16 }}>
                  Metode Pengiriman
                </h3>
                <div style={{ position: "relative" }}>
                  <select
                    value={selectedShipping.id}
                    onChange={(e) => {
                      const selected = SHIPPING_METHODS.find((s) => s.id === e.target.value);
                      if (selected) setSelectedShipping(selected);
                    }}
                    style={{
                      width: "100%",
                      height: 48,
                      borderRadius: 8,
                      border: "1.5px solid #D5CFC9",
                      padding: "0 40px 0 16px",
                      fontSize: "0.875rem",
                      color: "#1F1B18",
                      fontFamily: "inherit",
                      appearance: "none",
                      background: "white",
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    {SHIPPING_METHODS.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.name}
                      </option>
                    ))}
                  </select>
                  <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: "#5C5550", pointerEvents: "none" }}>
                    <ChevronDown size={18} />
                  </div>
                </div>
              </div>

              {/* 4. PAYMENT METHOD */}
              <div style={{
                background: "white",
                border: "1px solid #EAE5E0",
                borderRadius: 12,
                padding: 24,
              }}>
                <h3 style={{ fontSize: "0.8125rem", fontWeight: 800, color: "#8E8680", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 16 }}>
                  Pilih Pembayaran
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {PAYMENT_METHODS.map((method) => {
                    const isSelected = selectedPayment === method.id;
                    return (
                      <div
                        key={method.id}
                        onClick={() => setSelectedPayment(method.id)}
                        style={{
                          border: isSelected ? "1.5px solid #1D4ED8" : "1.5px solid #EAE5E0",
                          borderRadius: 8,
                          padding: 16,
                          background: isSelected ? "#EFF6FF" : "white",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          border: isSelected ? "5.5px solid #1D4ED8" : "1.5px solid #D5CFC9",
                          background: "white",
                          flexShrink: 0,
                          transition: "all 0.15s ease",
                        }} />
                        <div>
                          <p style={{ fontSize: "0.8125rem", fontWeight: 800, color: "#1F1B18", marginBottom: 2 }}>
                            {method.name}
                          </p>
                          <p style={{ fontSize: "0.75rem", color: "#8E8680" }}>
                            {method.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* RIGHT SIDEBAR */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              
              {/* VOUCHER BLOCK */}
              <div style={{
                background: "white",
                border: "1px solid #EAE5E0",
                borderRadius: 12,
                padding: 20,
              }}>
                <h4 style={{ fontSize: "0.8125rem", fontWeight: 800, color: "#1F1B18", marginBottom: 12 }}>
                  Makin Hemat dengan Promo
                </h4>
                <form onSubmit={handleApplyVoucher} style={{ display: "flex", gap: 8 }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#8E8680" }}>
                      <Tag size={16} />
                    </span>
                    <input
                      type="text"
                      placeholder="Masukkan kode voucher"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      style={{
                        width: "100%",
                        height: 38,
                        borderRadius: 6,
                        border: "1.5px solid #D5CFC9",
                        padding: "0 12px 0 36px",
                        fontSize: "0.8125rem",
                        color: "#1F1B18",
                        fontFamily: "inherit",
                        outline: "none",
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    style={{
                      height: 38,
                      padding: "0 16px",
                      background: "#262524",
                      color: "white",
                      borderRadius: 6,
                      fontSize: "0.8125rem",
                      fontWeight: 700,
                      border: "none",
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                  >
                    Gunakan
                  </button>
                </form>

                {voucherError && (
                  <p style={{ fontSize: "0.75rem", color: "#DC2626", marginTop: 6, margin: "6px 0 0" }}>
                    {voucherError}
                  </p>
                )}

                {appliedVoucher && (
                  <div style={{
                    marginTop: 10,
                    padding: "8px 12px",
                    borderRadius: 6,
                    background: "#EBFDF2",
                    border: "1px solid #BBF7D0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#15803D" }}>
                      Voucher {appliedVoucher.code} Aktif
                    </span>
                    <button
                      onClick={() => setAppliedVoucher(null)}
                      style={{ fontSize: "0.75rem", fontWeight: 700, color: "#DC2626", background: "none", border: "none", cursor: "pointer" }}
                    >
                      Batal
                    </button>
                  </div>
                )}
              </div>

              {/* SHOPPING SUMMARY */}
              <div style={{
                background: "white",
                border: "1px solid #EAE5E0",
                borderRadius: 12,
                padding: 24,
              }}>
                <h4 style={{ fontSize: "0.8125rem", fontWeight: 800, color: "#1F1B18", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
                  Ringkasan Belanja
                </h4>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: "0.8125rem", color: "#5C5550" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Total Harga ({ORDER_ITEMS.reduce((s, i) => s + i.quantity, 0)} Barang)</span>
                    <span style={{ color: "#1F1B18" }}>Rp {totalItemPrice.toLocaleString("id-ID")}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Total Ongkos Kirim ({totalWeight.toFixed(1)} kg)</span>
                    <span style={{ color: "#1F1B18" }}>Rp {shippingCost.toLocaleString("id-ID")}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Biaya Layanan</span>
                    <span style={{ color: "#1F1B18" }}>Rp {serviceFee.toLocaleString("id-ID")}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#15803D" }}>
                    <span>Total Diskon</span>
                    <span>-Rp {totalDiscount.toLocaleString("id-ID")}</span>
                  </div>

                  <div style={{ height: 1, background: "#EAE5E0", margin: "4px 0" }} />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: "0.875rem", fontWeight: 800 }}>
                    <span style={{ color: "#1F1B18" }}>Total Tagihan</span>
                    <span style={{ color: "#1D4ED8", fontSize: "1.25rem", letterSpacing: "-0.02em" }}>
                      Rp {totalBill.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePayNow}
                  disabled={isProcessing}
                  style={{
                    width: "100%",
                    height: 48,
                    background: "#1D4ED8",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    fontSize: "0.9375rem",
                    fontWeight: 700,
                    marginTop: 20,
                    cursor: isProcessing ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "background 0.15s",
                  }}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <span>Bayar Sekarang</span>
                  )}
                </button>

                <p style={{ fontSize: "0.725rem", color: "#8E8680", textAlign: "center", lineHeight: 1.4, marginTop: 12, margin: "12px 0 0" }}>
                  Dengan membayar, Anda menyetujui <span style={{ color: "#1D4ED8", cursor: "pointer" }}>Syarat & Ketentuan</span> Pelataran UMKM.
                </p>
              </div>

            </div>

          </div>

        </div>
      </main>

      {/* EDIT ADDRESS MODAL */}
      {isEditAddressOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(31, 27, 24, 0.4)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1100,
        }}>
          <div style={{
            background: "white",
            width: "100%",
            maxWidth: 480,
            borderRadius: 12,
            border: "1px solid #EAE5E0",
            padding: 24,
            boxShadow: "var(--shadow-lg)",
            animation: "notif-slide-down 0.2s ease",
          }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#1F1B18", marginBottom: 16 }}>
              Ubah Alamat Pengiriman
            </h3>
            <form onSubmit={handleSaveAddress} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#5C5550", marginBottom: 6 }}>
                  Nama Penerima
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#8E8680" }}>
                    <User size={14} />
                  </span>
                  <input
                    type="text"
                    required
                    value={tempAddress.name}
                    onChange={(e) => setTempAddress({ ...tempAddress, name: e.target.value })}
                    style={{ width: "100%", height: 38, border: "1.5px solid #D5CFC9", borderRadius: 6, padding: "0 12px 0 34px", fontSize: "0.8125rem", fontFamily: "inherit" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#5C5550", marginBottom: 6 }}>
                  Nomor HP
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#8E8680" }}>
                    <Phone size={14} />
                  </span>
                  <input
                    type="text"
                    required
                    value={tempAddress.phone}
                    onChange={(e) => setTempAddress({ ...tempAddress, phone: e.target.value })}
                    style={{ width: "100%", height: 38, border: "1.5px solid #D5CFC9", borderRadius: 6, padding: "0 12px 0 34px", fontSize: "0.8125rem", fontFamily: "inherit" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#5C5550", marginBottom: 6 }}>
                  Alamat Lengkap
                </label>
                <textarea
                  required
                  rows={3}
                  value={tempAddress.details}
                  onChange={(e) => setTempAddress({ ...tempAddress, details: e.target.value })}
                  style={{ width: "100%", border: "1.5px solid #D5CFC9", borderRadius: 6, padding: 12, fontSize: "0.8125rem", fontFamily: "inherit", resize: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 6, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setIsEditAddressOpen(false)}
                  style={{ height: 38, padding: "0 16px", background: "none", border: "1.5px solid #D5CFC9", borderRadius: 6, fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{ height: 38, padding: "0 16px", background: "#1D4ED8", color: "white", border: "none", borderRadius: 6, fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer" }}
                >
                  Simpan Alamat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAYMENT SUCCESS MODAL */}
      {isSuccess && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(31, 27, 24, 0.4)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1200,
        }}>
          <div style={{
            background: "white",
            width: "100%",
            maxWidth: 440,
            borderRadius: 16,
            border: "1px solid #EAE5E0",
            padding: 32,
            boxShadow: "var(--shadow-lg)",
            textAlign: "center",
            animation: "notif-slide-down 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          }}>
            <div style={{ color: "#15803D", display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <CheckCircle2 size={56} />
            </div>
            
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#1F1B18", marginBottom: 6 }}>
              Pembayaran Berhasil!
            </h2>
            <p style={{ fontSize: "0.8125rem", color: "#5C5550", marginBottom: 20 }}>
              Pesanan Anda telah diterima dan pelapak akan segera mengirimkannya.
            </p>

            <div style={{
              background: "#FCFCFA",
              border: "1px solid #EAE5E0",
              borderRadius: 8,
              padding: 16,
              marginBottom: 24,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              textAlign: "left",
              fontSize: "0.8125rem",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#8E8680" }}>No. Transaksi</span>
                <span style={{ fontWeight: 700, color: "#1F1B18" }}>TRX-202606190045</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#8E8680" }}>Metode Pembayaran</span>
                <span style={{ fontWeight: 700, color: "#1F1B18" }}>
                  {PAYMENT_METHODS.find((p) => p.id === selectedPayment)?.name}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#8E8680" }}>Total Dibayar</span>
                <span style={{ fontWeight: 800, color: "#1D4ED8" }}>Rp {totalBill.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <Link href="/" style={{
              width: "100%",
              height: 44,
              background: "#1D4ED8",
              color: "white",
              borderRadius: 8,
              fontSize: "0.875rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              textDecoration: "none",
              transition: "background 0.15s",
            }}>
              <span>Kembali ke Beranda</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
