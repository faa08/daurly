"use client";

import Image from "next/image";
import { ShoppingCart, Star, ArrowRight } from "lucide-react";
import Link from "next/link";

const PRODUCTS = [
  {
    id: 1,
    name: "Mangkuk Keramik Motif Megamendung Handmade",
    category: "KERAJINAN",
    price: 125000,
    image: "/product-keramik.png",
    rating: 4.9,
    sold: 120,
    badge: "Bestseller",
    slug: "mangkuk-keramik-megamendung",
  },
  {
    id: 2,
    name: "Kopi Toraja Arabika 250g Premium Roasted",
    category: "KULINER",
    price: 85000,
    image: "/product-kopi.png",
    rating: 4.8,
    sold: 340,
    badge: "Bestseller",
    slug: "kopi-toraja-arabika-250g",
  },
  {
    id: 3,
    name: "Dompet Kulit Sapi Asli Handmade Cognac Brown",
    category: "FASHION",
    price: 210000,
    image: "/product-dompet.png",
    rating: 5.0,
    sold: 50,
    badge: "",
    slug: "dompet-kulit-cognac-brown",
  },
  {
    id: 4,
    name: "Paket Perawatan Wajah Alami Ekstrak Kunyit",
    category: "KESEHATAN",
    price: 175000,
    image: "/product-skincare.png",
    rating: 4.3,
    sold: 80,
    badge: "Bestseller",
    slug: "skincare-kunyit-alami",
  },
  {
    id: 5,
    name: "Kain Batik Tulis Motif Truntum Klasik",
    category: "FASHION",
    price: 450000,
    image: "/product-batik.png",
    rating: 5.0,
    sold: 12,
    badge: "",
    slug: "batik-tulis-truntum-klasik",
  },
];

function formatPrice(price: number) {
  return `Rp ${price.toLocaleString("id-ID")}`;
}

export default function FeaturedProducts() {
  return (
    <section className="section-featured-products">
      <div className="container">
        <div className="section-header-custom">
          <div>
            <h2 className="section-title-custom">Produk Unggulan</h2>
            <p className="section-subtitle-custom">Kualitas terbaik yang paling banyak dicari</p>
          </div>
          <Link href="/produk" className="section-see-all-orange flex-center-gap">
            <span>Lihat Semua</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="products-grid-five">
          {PRODUCTS.map((product) => (
            <article
              key={product.id}
              className="product-card-custom"
              id={`product-${product.id}`}
            >
              <Link href={`/produk/${product.slug}`}>
                <div className="product-image-container">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 768px) 50vw, 220px"
                  />
                  {product.badge && (
                    <span className="product-badge-orange">
                      {product.badge}
                    </span>
                  )}
                  <button
                    className="product-cart-button-floating"
                    aria-label={`Tambah ${product.name} ke keranjang`}
                    id={`add-cart-${product.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <ShoppingCart size={15} />
                  </button>
                </div>

                <div className="product-info-custom">
                  <p className="product-category-custom">{product.category}</p>
                  <h3 className="product-name-custom">{product.name}</h3>
                  <p className="product-price-custom">{formatPrice(product.price)}</p>
                  <div className="product-meta-custom">
                    <span className="rating-star-orange">★</span>
                    <span className="rating-value-bold">{product.rating}</span>
                    <span className="rating-divider-line">|</span>
                    <span className="sold-count-text">{product.sold} terjual</span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
