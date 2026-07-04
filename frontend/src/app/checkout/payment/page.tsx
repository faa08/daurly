"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2, ArrowRight, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { authService } from "@/backend/authService";
import { orderService } from "@/backend/orderService";
import { apiFetch } from "@/lib/api-client";

const isDevSimulator =
  process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_ALLOW_PAYMENT_SIMULATOR === "true";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const amount = Number(searchParams.get("amount")) || 0;

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<{ id_order: string; total_hrg?: number }[]>([]);
  
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      router.replace("/masuk?redirect=/checkout/payment");
      return;
    }

    const placed = orderService.getPlacedOrders();
    if (!placed?.orders?.length) {
      router.replace("/keranjang");
      return;
    }
    setOrders(placed.orders);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <main style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={32} color="#FF6F00" className="animate-spin" />
      </main>
    );
  }

  const firstOrderId = orders[0]?.id_order || "";
  const totalBill = amount || orders.reduce((s, o) => s + (o.total_hrg || 0), 0);
  const orderIdDisplay = firstOrderId ? `ORD-${firstOrderId.replace(/-/g, "").slice(0, 8).toUpperCase()}` : "";
  
  // WhatsApp Link Setup
  const adminWaNumber = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "6281234567890";
  const waText = `Halo Admin Pelataran UMKM, saya ingin melakukan konfirmasi pembayaran untuk pesanan ${orderIdDisplay} sebesar Rp ${totalBill.toLocaleString("id-ID")} menggunakan QRIS E-Wallet.`;
  const waUrl = `https://wa.me/${adminWaNumber}?text=${encodeURIComponent(waText)}`;

  const handleFinishCheckout = () => {
    // Clear checkout session so user doesn't double checkout the same items
    orderService.clearCheckoutSession();
    sessionStorage.removeItem("pelum_checkout_voucher");
    router.push("/account/orders");
  };

  return (
    <main style={{ background: "#FCFCFA", minHeight: "80vh", padding: "48px 24px" }}>
      <div style={{
        maxWidth: 520, margin: "0 auto", background: "white", borderRadius: 16,
        border: "1px solid #EAE5E0", padding: 32, boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
        textAlign: "center"
      }}>
        <span style={{
          fontSize: "0.65rem", fontWeight: 800, color: "white", background: "#FF6F00",
          padding: "4px 8px", borderRadius: 4, letterSpacing: "0.05em", textTransform: "uppercase",
        }}>
          Metode E-Wallet (QRIS)
        </span>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "16px 0 8px", color: "#1F1B18" }}>
          Instruksi Pembayaran QRIS
        </h1>
        <p style={{ fontSize: "0.85rem", color: "#5C5550", marginBottom: 24, lineHeight: 1.5 }}>
          Silakan pindai kode QRIS di bawah ini untuk menyelesaikan pembayaran pesanan Anda secara manual.
        </p>

        {/* Billing Box */}
        <div style={{ background: "#FFF7ED", borderRadius: 12, border: "1.5px solid #FFEDD5", padding: 18, marginBottom: 24 }}>
          <p style={{ fontSize: "0.75rem", color: "#7C2D12", margin: "0 0 4px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Total Pembayaran
          </p>
          <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "#FF6F00", margin: 0 }}>
            Rp {totalBill.toLocaleString("id-ID")}
          </p>
          {orderIdDisplay && (
            <p style={{ fontSize: "0.75rem", color: "#9A3412", margin: "8px 0 0", fontWeight: 600 }}>
              Kode Referensi: {orderIdDisplay}
            </p>
          )}
        </div>

        {/* QRIS Code Image */}
        <div style={{
          display: "flex", justifyContent: "center", alignItems: "center",
          background: "#F9F8F6", border: "1px dashed #D5CFC9", borderRadius: 12,
          padding: 16, marginBottom: 24
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/qr.jpeg"
            alt="QRIS Code Pelataran UMKM"
            style={{ maxWidth: "240px", height: "auto", display: "block" }}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.style.display = "none";
            }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          <Link
            href={`/account/orders/${firstOrderId}/chat`}
            onClick={() => {
              orderService.clearCheckoutSession();
              sessionStorage.removeItem("pelum_checkout_voucher");
            }}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              height: 48, background: "#1D4ED8", color: "white", borderRadius: 8,
              fontWeight: 800, fontSize: "0.875rem", textDecoration: "none",
              transition: "opacity 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
            onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
          >
            Hubungi Admin (Chat Aplikasi)
          </Link>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              orderService.clearCheckoutSession();
              sessionStorage.removeItem("pelum_checkout_voucher");
            }}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              height: 48, background: "#16A34A", color: "white", borderRadius: 8,
              fontWeight: 800, fontSize: "0.875rem", textDecoration: "none",
              transition: "opacity 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
            onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
          >
            Hubungi Admin (WhatsApp)
          </a>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #EAE5E0", margin: "24px 0" }} />

        <div style={{ textAlign: "left", marginBottom: 24 }}>
          <h4 style={{ fontSize: "0.8125rem", fontWeight: 800, color: "#1F1B18", marginBottom: 6 }}>
            📢 Langkah Konfirmasi Pembayaran:
          </h4>
          <ol style={{ fontSize: "0.78rem", color: "#5C5550", margin: 0, paddingLeft: 18, lineHeight: 1.5 }}>
            <li>Lakukan scan kode QRIS dan bayar sesuai nominal di atas.</li>
            <li>Ambil screenshot bukti transaksi sukses.</li>
            <li>Klik tombol chat di atas untuk mengirim bukti atau buka menu <b>Pesanan Saya</b> lalu unggah bukti pembayaran agar pesanan Anda dapat dikonfirmasi oleh Admin.</li>
          </ol>
        </div>

        <button
          onClick={handleFinishCheckout}
          style={{
            width: "100%", height: 44, background: "none",
            border: "1.5px solid #D5CFC9", borderRadius: 8, color: "#5C5550",
            fontWeight: 850, fontSize: "0.8125rem", cursor: "pointer",
            transition: "background 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.background = "#F9F8F6"}
          onMouseOut={(e) => e.currentTarget.style.background = "none"}
        >
          Lihat Pesanan Saya & Unggah Bukti
        </button>
      </div>
    </main>
  );
}

export default function CheckoutPaymentPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <main style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Loader2 size={32} color="#1D4ED8" className="animate-spin" />
        </main>
      }>
        <PaymentContent />
      </Suspense>
      <Footer />
    </>
  );
}
