import { Utensils, Shirt, Paintbrush, Wrench } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  { id: 1, name: "Kuliner", icon: <Utensils size={20} />, href: "/kategori/kuliner" },
  { id: 2, name: "Fashion", icon: <Shirt size={20} />, href: "/kategori/fashion" },
  { id: 3, name: "Kerajinan", icon: <Paintbrush size={20} />, href: "/kategori/kerajinan" },
  { id: 4, name: "Jasa", icon: <Wrench size={20} />, href: "/kategori/jasa" },
];

export default function Categories() {
  return (
    <section className="section-categories">
      <div className="container">
        <div className="section-header-custom">
          <h2 className="section-title-custom">Kategori Pilihan</h2>
          <Link href="/kategori" className="section-see-all-orange">
            Lihat Semua
          </Link>
        </div>

        <div className="categories-grid-four">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="category-card-custom"
              id={`category-${cat.name.toLowerCase()}`}
            >
              <div className="category-icon-box">
                {cat.icon}
              </div>
              <span className="category-name-custom">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
