"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Tag,
  Phone,
  User,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { authService } from "@/backend/authService";
import { cartService } from "@/backend/cartService";
import { orderService, CheckoutOrderResult, PaymentMethodId } from "@/backend/orderService";
import { supabase } from "@/backend/supabase";
import { apiFetch } from "@/lib/api-client";
import {
  PICKUP_CONFIRM_SECONDS,
  PICKUP_STORE_ADDRESS,
  DEFAULT_PAYMENT_TYPE,
  getAvailablePaymentOptions,
  isDigitalPaymentConfigured,
} from "@/lib/checkoutConstants";

interface CheckoutItem {
  id_cart_item: string;
  id_produk: string;
  name: string;
  quantity: number;
  weight: number;
  price: number;
  image: string;
}

function parseProductImg(img?: string | null): string {
  if (!img) return "/product-keramik.png";
  if (img.startsWith("[")) {
    try {
      const arr = JSON.parse(img);
      return arr[0] || "/product-keramik.png";
    } catch {
      return "/product-keramik.png";
    }
  }
  return img;
}

const isPlaceholder = () =>
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [addressId, setAddressId] = useState<string | null>(null);
  // Address State
  const [address, setAddress] = useState({
    name: "",
    phone: "",
    details: "",
  });
  const [isEditAddressOpen, setIsEditAddressOpen] = useState(false);
  const [tempAddress, setTempAddress] = useState({ ...address });

  // Order Items State
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [placedOrders, setPlacedOrders] = useState<CheckoutOrderResult[]>([]);
  const [transactionRef, setTransactionRef] = useState("");

  // Payment State
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentMethodId>(DEFAULT_PAYMENT_TYPE);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [pickupCountdown, setPickupCountdown] = useState(PICKUP_CONFIRM_SECONDS);
  const [pickupCanConfirm, setPickupCanConfirm] = useState(false);

  // Voucher State
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherError, setVoucherError] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    discount_type: string;
    value: number;
    max_discount: number;
    min_purchase: number;
  } | null>(null);

  // checkout status
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMode, setSuccessMode] = useState<"digital" | "offline">("digital");

  useEffect(() => {
    async function loadCheckout() {
      const user = authService.getCurrentUser();
      if (!user) {
        router.replace("/masuk?redirect=/checkout");
        return;
      }

      const cartIds = orderService.getCheckoutCartIds();
      if (!cartIds.length) {
        router.replace("/keranjang");
        return;
      }

      const dbItems = await cartService.getCartItems(user.id_user);
      const filtered = dbItems.filter((i) => cartIds.includes(i.id_cart_item) && i.produk);
      if (!filtered.length) {
        router.replace("/keranjang");
        return;
      }

      setItems(
        filtered.map((i) => ({
          id_cart_item: i.id_cart_item,
          id_produk: i.id_produk,
          name: i.produk!.nama_produk,
          quantity: i.qty_cartitem,
          weight: i.produk!.berat || 500,
          price: i.produk!.harga,
          image: parseProductImg(i.produk!.img),
        }))
      );

      if (!isPlaceholder()) {
        const { data: addresses } = await supabase
          .from("alamat")
          .select("*")
          .eq("id_user", user.id_user)
          .order("is_utama", { ascending: false });

        if (addresses?.length) {
          const primary = addresses.find((a) => a.is_utama) || addresses[0];
          setAddressId(primary.id_alamat);
          const details = `${primary.detail_alamat}, ${primary.kecamatan}, ${primary.kota}, ${primary.provinsi}${primary.kode_pos ? ` ${primary.kode_pos}` : ""}`;
          const addr = {
            name: `${primary.nama_penerima}${primary.is_utama ? " (Utama)" : ""}`,
            phone: primary.no_telp,
            details,
          };
          setAddress(addr);
          setTempAddress(addr);
        }
      }

      const vRaw = sessionStorage.getItem("pelum_checkout_voucher");
      if (vRaw) {
        try {
          const v = JSON.parse(vRaw);
          if (v.code) setAppliedVoucher(v);
        } catch { /* ignore */ }
      }

      setLoading(false);
    }
    loadCheckout();
  }, [router]);

  useEffect(() => {
    if (!showPickupModal) return;
    setPickupCountdown(PICKUP_CONFIRM_SECONDS);
    setPickupCanConfirm(false);
    const interval = setInterval(() => {
      setPickupCountdown((prev) => {
        if (prev <= 1) {
          setPickupCanConfirm(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showPickupModal]);

  const isOffline = selectedPaymentType === "offline";
  const totalItemPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = 0;
  const serviceFee = 2000;
  const totalDiscount = appliedVoucher
    ? appliedVoucher.discount_type === "percentage"
      ? Math.min(
          Number(appliedVoucher.max_discount) > 0 ? Number(appliedVoucher.max_discount) : Infinity,
          Math.floor(totalItemPrice * (Number(appliedVoucher.value) / 100))
        )
      : Number(appliedVoucher.value)
    : 0;
  const totalBill = Math.max(0, totalItemPrice + shippingCost + serviceFee - totalDiscount);

  const handleApplyVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = voucherCode.trim().toUpperCase();
    if (!code) return;

    try {
      const res = await apiFetch("/api/voucher/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal: totalItemPrice }),
      });
      const data = await res.json();
      if (!res.ok) {
        setVoucherError(data.error || "Voucher tidak valid.");
        setAppliedVoucher(null);
        return;
      }

      setAppliedVoucher(data.voucher);
      setVoucherError("");
      sessionStorage.setItem("pelum_checkout_voucher", JSON.stringify(data.voucher));
    } catch (err) {
      console.error(err);
      setVoucherError("Gagal memvalidasi voucher.");
    }
  };

  const updateQty = async (id: string, delta: number) => {
    const item = items.find((i) => i.id_cart_item === id);
    if (!item) return;
    const newQty = Math.max(1, item.quantity + delta);
    setItems((prev) =>
      prev.map((it) =>
        it.id_cart_item === id ? { ...it, quantity: newQty } : it
      )
    );
    await cartService.updateCartQuantity(id, newQty);
  };

  const startDigitalPayment = async (orders: CheckoutOrderResult[], ref: string) => {
    const user = authService.getCurrentUser();
    if (!user) return;

    const grossAmount = orders.reduce((s, o) => s + o.total_hrg, 0);
    router.push(
      `/checkout/payment?ref=${encodeURIComponent(ref)}&amount=${grossAmount}`
    );
  };

  const handlePayNow = async () => {
    const user = authService.getCurrentUser();
    if (!user) {
      router.replace("/masuk?redirect=/checkout");
      return;
    }

    if (isOffline) {
      setShowPickupModal(true);
      return;
    }

    if (!addressId) {
      alert("Tambahkan alamat pengiriman terlebih dahulu di menu Akun → Alamat.");
      router.push("/account/address");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await orderService.checkout({
        userId: user.id_user,
        cartItemIds: orderService.getCheckoutCartIds(),
        addressId,
        courier: "Dikonfirmasi Admin",
        paymentType: "digital",
        shippingCost,
        diskon: totalDiscount,
        biayaLayanan: serviceFee,
      });
      orderService.savePlacedOrders(result.orders, result.transactionRef);
      setPlacedOrders(result.orders);
      setTransactionRef(result.transactionRef);
      await startDigitalPayment(result.orders, result.transactionRef);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal membuat pesanan.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmPickup = async () => {
    if (!pickupCanConfirm) return;
    const user = authService.getCurrentUser();
    if (!user) return;

    setIsProcessing(true);
    try {
      const result = await orderService.checkout({
        userId: user.id_user,
        cartItemIds: orderService.getCheckoutCartIds(),
        addressId: null,
        courier: "Ambil di Toko",
        paymentType: "offline",
        shippingCost: 0,
        diskon: totalDiscount,
        biayaLayanan: serviceFee,
      });
      orderService.savePlacedOrders(result.orders, result.transactionRef);
      setPlacedOrders(result.orders);
      setTransactionRef(result.transactionRef);

      await orderService.completePayment(
        result.orders.map((o) => o.id_order),
        true,
        { paymentType: "offline" }
      );

      orderService.clearCheckoutSession();
      sessionStorage.removeItem("pelum_checkout_voucher");
      setShowPickupModal(false);
      setSuccessMode("offline");
      setIsSuccess(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal membuat pesanan pickup.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddress({ ...tempAddress });
    setIsEditAddressOpen(false);

    if (!addressId || isPlaceholder()) return;
    const user = authService.getCurrentUser();
    if (!user) return;

    const parts = tempAddress.details.split(",").map((s) => s.trim());
    await supabase
      .from("alamat")
      .update({
        nama_penerima: tempAddress.name.replace(/\s*\(Utama\)\s*$/, ""),
        no_telp: tempAddress.phone,
        detail_alamat: parts[0] || tempAddress.details,
      })
      .eq("id_alamat", addressId)
      .eq("id_user", user.id_user);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main style={{ background: "#FCFCFA", minHeight: "85vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Loader2 size={32} color="#1D4ED8" className="animate-spin" />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="page-main-shell" style={{ background: "#FCFCFA", minHeight: "85vh" }}>
        <div className="page-main-inner">
          <>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#1F1B18", marginBottom: 24 }}>
                Checkout
              </h1>

              <div className="checkout-grid">

                {/* LEFT COLUMN */}
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                  {/* 1. SHIPPING ADDRESS / PICKUP */}
                  <div style={{
                    background: "white",
                    border: "1px solid #EAE5E0",
                    borderRadius: 12,
                    padding: 24,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <h3 style={{ fontSize: "0.8125rem", fontWeight: 800, color: "#8E8680", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        {isOffline ? "Lokasi Pickup" : "Alamat Pengiriman"}
                      </h3>
                      {!isOffline && (
                      <button 
                        onClick={() => {
                          setTempAddress({ ...address });
                          setIsEditAddressOpen(true);
                        }}
                        style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#1D4ED8", border: "none", cursor: "pointer", background: "none" }}
                      >
                        Ubah
                      </button>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                      <div style={{ color: "#1D4ED8", marginTop: 2 }}>
                        <MapPin size={18} />
                      </div>
                      {isOffline ? (
                        <div>
                          <p style={{ fontSize: "0.875rem", fontWeight: 800, color: "#1F1B18", marginBottom: 4 }}>
                            Ambil di Toko Kami
                          </p>
                          <p style={{ fontSize: "0.8125rem", color: "#5C5550", lineHeight: 1.5 }}>
                            {PICKUP_STORE_ADDRESS}
                          </p>
                        </div>
                      ) : addressId ? (
                        <div>
                          <p style={{ fontSize: "0.875rem", fontWeight: 800, color: "#1F1B18", marginBottom: 4 }}>
                            {address.name} <span style={{ fontWeight: 500, color: "#5C5550" }}>({address.phone})</span>
                          </p>
                          <p style={{ fontSize: "0.8125rem", color: "#5C5550", lineHeight: 1.5 }}>
                            {address.details}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#DC2626", marginBottom: 8 }}>
                            Belum ada alamat pengiriman
                          </p>
                          <Link href="/account/address" style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#1D4ED8" }}>
                            Tambah alamat →
                          </Link>
                        </div>
                      )}
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
                      {items.map((item) => (
                        <div key={item.id_cart_item} style={{ display: "flex", gap: 16, alignItems: "center" }}>
                          <div style={{ position: "relative", width: 64, height: 64, borderRadius: 8, overflow: "hidden", background: "#F8F6F4", border: "1px solid #EAE5E0" }}>
                            <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} />
                          </div>
                          <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
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

                            {/* Dynamic quantity controls */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1.5px solid #D5CFC9", borderRadius: 6, padding: "2px 4px", background: "#FCFCFA" }}>
                              <button
                                onClick={() => updateQty(item.id_cart_item, -1)}
                                disabled={item.quantity <= 1}
                                style={{
                                  width: 24, height: 24, border: "none", background: "none", 
                                  color: item.quantity <= 1 ? "#8E8680" : "#1F1B18",
                                  cursor: item.quantity <= 1 ? "not-allowed" : "pointer",
                                  fontWeight: "bold", fontSize: "0.875rem", display: "flex", alignItems: "center", justifyContent: "center"
                                }}
                              >
                                -
                              </button>
                              <span style={{ fontSize: "0.8125rem", fontWeight: 700, minWidth: 16, textAlign: "center" }}>
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQty(item.id_cart_item, 1)}
                                style={{
                                  width: 24, height: 24, border: "none", background: "none", color: "#1F1B18",
                                  cursor: "pointer", fontWeight: "bold", fontSize: "0.875rem", display: "flex", alignItems: "center", justifyContent: "center"
                                }}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ height: 1, background: "#EAE5E0", margin: "16px 0" }} />

                    <div style={{ display: "flex", justifyContent: "flex-end", fontSize: "0.8125rem", color: "#5C5550" }}>
                      <span>Subtotal: <strong style={{ color: "#1F1B18", fontWeight: 700 }}>Rp {totalItemPrice.toLocaleString("id-ID")}</strong></span>
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
                    {!isDigitalPaymentConfigured() && (
                      <p style={{
                        fontSize: "0.75rem",
                        color: "#92400E",
                        background: "#FFFBEB",
                        border: "1px solid #FDE68A",
                        borderRadius: 8,
                        padding: "10px 12px",
                        marginBottom: 14,
                        lineHeight: 1.5,
                      }}>
                        Pembayaran digital belum aktif. Gunakan <strong>Ambil di Toko</strong> untuk sementara.
                      </p>
                    )}
                    <div className="payment-options-grid">
                      {getAvailablePaymentOptions().map((method) => {
                        const isSelected = selectedPaymentType === method.id;
                        return (
                          <div
                            key={method.id}
                            onClick={() => setSelectedPaymentType(method.id)}
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
                        <span>Total Harga ({items.reduce((s, i) => s + i.quantity, 0)} Barang)</span>
                        <span style={{ color: "#1F1B18" }}>Rp {totalItemPrice.toLocaleString("id-ID")}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>{isOffline ? "Ongkos Kirim" : "Ongkos Kirim (via chat admin)"}</span>
                        <span style={{ color: "#1F1B18" }}>
                          {isOffline ? "Gratis (Pickup)" : "Dikonfirmasi setelah bayar"}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Biaya Layanan</span>
                        <span style={{ color: "#1F1B18" }}>Rp {serviceFee.toLocaleString("id-ID")}</span>
                      </div>
                      {totalDiscount > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", color: "#15803D" }}>
                          <span>Total Diskon</span>
                          <span>-Rp {totalDiscount.toLocaleString("id-ID")}</span>
                        </div>
                      )}

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
                    <span>{isOffline ? "Lanjut Pickup di Toko" : "Bayar Digital"}</span>
                  )}
                </button>

                <p style={{ fontSize: "0.725rem", color: "#8E8680", textAlign: "center", lineHeight: 1.4, marginTop: 12, margin: "12px 0 0" }}>
                  Dengan membayar, Anda menyetujui{" "}
                  <Link href="/bantuan/syarat-ketentuan" style={{ color: "#1D4ED8", fontWeight: 600 }}>
                    Syarat & Ketentuan
                  </Link>{" "}
                  Pelataran UMKM.
                </p>
              </div>

            </div>
          </div>
          </>
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

      {/* PICKUP CONFIRMATION MODAL */}
      {showPickupModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(31, 27, 24, 0.45)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1150,
          padding: 24,
        }}>
          <div style={{
            background: "white",
            width: "100%",
            maxWidth: 480,
            borderRadius: 16,
            border: "1px solid #EAE5E0",
            padding: 28,
            boxShadow: "var(--shadow-lg)",
          }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#1F1B18", marginBottom: 12 }}>
              Ambil di Toko Kami
            </h3>
            <p style={{ fontSize: "0.8125rem", color: "#5C5550", lineHeight: 1.6, marginBottom: 16 }}>
              Pesanan ini akan diambil langsung di toko kami. Silakan datang ke alamat berikut untuk bayar dan ambil barang:
            </p>
            <div style={{
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
              borderRadius: 10,
              padding: 16,
              marginBottom: 20,
            }}>
              <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#1F1B18", lineHeight: 1.5, margin: 0 }}>
                {PICKUP_STORE_ADDRESS}
              </p>
            </div>
            <p style={{ fontSize: "0.75rem", color: "#8E8680", marginBottom: 20 }}>
              Pembayaran dilakukan saat pickup di toko (cash/transfer di lokasi).
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowPickupModal(false)}
                style={{
                  flex: 1, height: 44, background: "none", border: "1.5px solid #D5CFC9",
                  borderRadius: 8, fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", color: "#5C5550",
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmPickup}
                disabled={!pickupCanConfirm || isProcessing}
                style={{
                  flex: 1, height: 44,
                  background: pickupCanConfirm ? "#1D4ED8" : "#93C5FD",
                  color: "white", border: "none", borderRadius: 8,
                  fontSize: "0.875rem", fontWeight: 700,
                  cursor: pickupCanConfirm && !isProcessing ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Memproses...
                  </>
                ) : pickupCanConfirm ? (
                  "Konfirmasi"
                ) : (
                  `Konfirmasi (${pickupCountdown}s)`
                )}
              </button>
            </div>
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
              {successMode === "offline" ? "Pesanan Pickup Dikonfirmasi!" : "Pembayaran Berhasil!"}
            </h2>
            <p style={{ fontSize: "0.8125rem", color: "#5C5550", marginBottom: 20 }}>
              {successMode === "offline"
                ? "Datang ke toko kami untuk bayar dan ambil pesanan Anda."
                : "Admin akan menghubungi Anda via chat untuk mengatur pengiriman."}
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
                <span style={{ fontWeight: 700, color: "#1F1B18" }}>{transactionRef || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#8E8680" }}>Metode</span>
                <span style={{ fontWeight: 700, color: "#1F1B18" }}>
                  {successMode === "offline" ? "Ambil di Toko" : "Bayar Digital"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#8E8680" }}>Total</span>
                <span style={{ fontWeight: 800, color: "#1D4ED8" }}>Rp {totalBill.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {successMode === "digital" && placedOrders[0] && (
              <Link href={`/account/orders/${placedOrders[0].id_order}/chat`} style={{
                width: "100%",
                height: 44,
                background: "#16A34A",
                color: "white",
                borderRadius: 8,
                fontSize: "0.875rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                textDecoration: "none",
              }}>
                Buka Chat Pengiriman
                <ArrowRight size={16} />
              </Link>
            )}
            <Link href={successMode === "offline" ? "/account/orders" : "/"} style={{
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
              <span>{successMode === "offline" ? "Lihat Pesanan Saya" : "Kembali ke Beranda"}</span>
              <ArrowRight size={16} />
            </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
