"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2, ShoppingCart, Star } from "lucide-react";

interface WishlistItem {
  id: number;
  name: string;
  price: number;
  rating: number;
  sold: number;
  image: string;
  seller: string;
  category: string;
}

const INITIAL_WISHLIST: WishlistItem[] = [
  { id: 1, name: "Kain Batik Tulis Motif Mega Mendung Premium", price: 450000, rating: 5.0, sold: 48, image: "/product-batik.png", seller: "Batik Craft Jogja", category: "Fashion" },
  { id: 2, name: "Mangkuk Keramik Handmade Motif Tradisional", price: 125000, rating: 4.9, sold: 120, image: "/product-keramik.png", seller: "Griya Keramik Kasongan", category: "Kerajinan" },
  { id: 3, name: "Kopi Arabika Gayo Single Origin 250g", price: 85000, rating: 4.8, sold: 340, image: "/product-kopi.png", seller: "Kopi Nusantara", category: "Kuliner" },
  { id: 4, name: "Dompet Kulit Sapi Asli Cognac Brown", price: 210000, rating: 5.0, sold: 50, image: "/product-dompet.png", seller: "Leather Craft ID", category: "Fashion" },
  { id: 5, name: "Paket Skincare Alami Ekstrak Kunyit", price: 175000, rating: 4.3, sold: 80, image: "/product-skincare.png", seller: "Herbal Beauty", category: "Kecantikan" },
];

function fmtPrice(p: number) { return `Rp ${p.toLocaleString("id-ID")}`; }

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>(INITIAL_WISHLIST);
  const [addedIds, setAddedIds] = useState<number[]>([]);

  function removeItem(id: number) { setItems((prev) => prev.filter((i) => i.id !== id)); }

  function addToCart(id: number) {
    setAddedIds((prev) => [...prev, id]);
    setTimeout(() => setAddedIds((prev) => prev.filter((i) => i !== id)), 2000);
  }

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-3">
          <Heart size={24} className="text-primary" fill="#1D4ED8" />
          <h2 className="font-headline text-3xl font-bold text-on-surface">Wishlist Saya</h2>
        </div>
        <p className="font-body text-body-md text-secondary mt-1">Produk yang kamu simpan untuk dibeli nanti.</p>
      </header>

      {items.length === 0 ? (
        <div className="bg-white border border-surface-container rounded-xl p-16 flex flex-col items-center gap-5 text-center shadow-sm">
          <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center">
            <Heart size={36} className="text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-on-surface mb-2">Wishlist Masih Kosong</h3>
            <p className="text-sm text-secondary leading-relaxed max-w-xs">Simpan produk favoritmu dengan menekan ikon hati di halaman produk.</p>
          </div>
          <Link href="/kategori" className="px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-lg hover:brightness-95 transition">
            Jelajahi Produk
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-secondary font-medium">
              <span className="font-bold text-on-surface">{items.length}</span> produk tersimpan
            </p>
            <button onClick={() => setItems([])} className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1.5">
              <Trash2 size={13} /> Hapus Semua
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => {
              const added = addedIds.includes(item.id);
              return (
                <div key={item.id} className="bg-white border border-surface-container rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition">
                  <div className="relative aspect-square bg-surface-container">
                    <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} sizes="220px" />
                    <button onClick={() => removeItem(item.id)} className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition" title="Hapus dari wishlist">
                      <Trash2 size={14} className="text-red-600" />
                    </button>
                    <div className="absolute top-2 left-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                      <Heart size={13} fill="white" color="white" />
                    </div>
                  </div>
                  <div className="p-3 flex flex-col flex-1 gap-2">
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">{item.category}</p>
                    <Link href={`/produk/${item.id}`} className="text-xs font-bold text-on-surface leading-snug line-clamp-2 hover:text-primary transition">{item.name}</Link>
                    <p className="text-sm font-extrabold text-primary">{fmtPrice(item.price)}</p>
                    <div className="flex items-center gap-1 text-[10px] text-secondary">
                      <Star size={10} fill="#F59E0B" color="#F59E0B" />
                      <span className="font-bold text-on-surface">{item.rating}</span>
                      <span>·</span>
                      <span>{item.sold} terjual</span>
                    </div>
                    <button onClick={() => addToCart(item.id)} className={`mt-auto w-full h-8 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition border ${added ? "bg-green-50 text-green-700 border-green-200" : "border-primary text-primary hover:bg-primary hover:text-white"}`}>
                      {added ? <>✓ Ditambahkan!</> : <><ShoppingCart size={12} />Tambah ke Keranjang</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
