"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import { productService } from "@/backend/productService";
import { cartService } from "@/backend/cartService";
import { authService } from "@/backend/authService";
import { productToCard, ProductGridImage } from "@/lib/productUi";

function formatPrice(price: number) {
  return `Rp ${price.toLocaleString("id-ID")}`;
}

interface FeaturedProductsProps {
  searchQuery?: string;
}

export default function FeaturedProducts({ searchQuery = "" }: FeaturedProductsProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await productService.getProducts({ publicOnly: true, limit: 10, hydrateImages: 10 });
        setProducts(
          data.map((p) => ({
            ...productToCard(p),
            badge: p.stok === 0 ? "Habis" : "Unggulan",
          }))
        );
        setLoading(false);

        const stats = await productService.getProductStats(data.map((p) => p.id_produk));
        setProducts(
          data.map((p) => ({
            ...productToCard(p, stats[p.id_produk]),
            badge: p.stok === 0 ? "Habis" : "Unggulan",
          }))
        );
      } catch (err) {
        console.error("Failed to load featured products:", err);
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="section-featured-products">
      <div className="container">
        <div className="section-header-custom">
          <div>
            <h2 className="section-title-custom">Produk Unggulan</h2>
            <p className="section-subtitle-custom">Kualitas terbaik yang paling banyak dicari</p>
          </div>
          <Link href="/kategori" className="section-see-all-orange flex-center-gap">
            <span>Lihat Semua</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <p style={{ color: "#8E8680", fontWeight: 600 }}>Memuat produk unggulan...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "60px 24px",
            background: "white",
            border: "1px solid #EAE5E0",
            borderRadius: 12,
            color: "#1F1B18",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: "40px", color: "#8E8680" }}>
              {searchQuery ? "search_off" : "inventory_2"}
            </span>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>
              {searchQuery ? "Produk Tidak Ditemukan" : "Belum Ada Produk"}
            </h3>
            <p style={{ fontSize: "0.8125rem", color: "#8E8680", margin: 0, maxWidth: 360, lineHeight: 1.5 }}>
              {searchQuery
                ? `Maaf, tidak ada produk yang cocok dengan kata kunci "${searchQuery}". Coba kata kunci lain.`
                : "Produk yang ditambahkan dari dashboard admin akan otomatis muncul di sini."}
            </p>
          </div>
        ) : (
          <div className="products-grid-five">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="product-card-custom"
                id={`product-${product.id}`}
              >
                <Link href={`/produk/${product.slug}`}>
                  <div className="product-image-container">
                    <ProductGridImage src={product.image} alt={product.name} sizes="(max-width: 768px) 50vw, 220px" />
                    {product.badge && (
                      <span className="product-badge-orange">
                        {product.badge}
                      </span>
                    )}
                    <button
                      className="product-cart-button-floating"
                      aria-label={`Tambah ${product.name} ke keranjang`}
                      id={`add-cart-${product.id}`}
                      onClick={async (e) => {
                        e.preventDefault();
                        const user = authService.getCurrentUser();
                        if (!user) {
                          alert("Silakan masuk terlebih dahulu untuk berbelanja.");
                          window.location.href = "/masuk";
                          return;
                        }
                        const result = await cartService.addToCart(user.id_user, product.id, 1);
                        if (result.ok) {
                          alert("Produk berhasil ditambahkan ke keranjang!");
                        } else {
                          alert(result.error || "Gagal menambahkan ke keranjang.");
                        }
                      }}
                    >
                      <ShoppingCart size={15} />
                    </button>
                  </div>

                  <div className="product-info-custom">
                    <p className="product-category-custom">{product.category}</p>
                    <h3 className="product-name-custom">{product.name}</h3>
                    <p className="product-price-custom">{product.priceRange || formatPrice(product.price)}</p>
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
        )}
      </div>
    </section>
  );
}
