export interface CategoryHeroProps {
  badge?: string;
  title: string;
  description: string;
  /** URL gambar latar — kosongkan untuk memakai gradient default */
  backgroundImage?: string;
  /** Posisi gambar latar, default `center` */
  backgroundPosition?: string;
}

export default function CategoryHero({
  badge = "Galeri Daur Ulang Pilihan",
  title,
  description,
  backgroundImage,
  backgroundPosition = "center",
}: CategoryHeroProps) {
  const hasImage = Boolean(backgroundImage);

  return (
    <div
      className={`category-hero ${hasImage ? "category-hero--image" : "category-hero--gradient"}`}
      style={
        hasImage
          ? {
              backgroundImage: `url(${backgroundImage})`,
              backgroundPosition,
            }
          : undefined
      }
    >
      {hasImage && <div className="category-hero-overlay" aria-hidden="true" />}

      {!hasImage && (
        <div className="category-hero-decoration" aria-hidden="true" />
      )}

      <div className="category-hero-content">
        <span className="category-hero-badge">{badge}</span>
        <h1 className="category-hero-title">{title}</h1>
        <p className="category-hero-desc">{description}</p>
      </div>
    </div>
  );
}
