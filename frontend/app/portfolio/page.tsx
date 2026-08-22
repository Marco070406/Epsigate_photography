"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ArrowRight,
} from "lucide-react";
import type { PortfolioItem, Category } from "@/lib/types";
import { API_BASE_URL, resolveImageUrl } from "@/lib/api";

const initialPortfolioItems: PortfolioItem[] = [
  {
    id: 1,
    title: "Mariage au Domaine des Étoiles",
    category: "Mariage",
    src: "/wedding.jpg",
    description: "Élégance gothique et lumières tamisées pour une union royale.",
  },
  {
    id: 2,
    title: "Collection Soie & Pourpre",
    category: "Mode",
    src: "/fashion.jpg",
    description: "Shooting éditorial haute couture, drapé architectural et clair-obscur.",
  },
  {
    id: 3,
    title: "Portrait Dirigeante d'Entreprise",
    category: "Portrait",
    src: "/portrait.jpg",
    description: "Éclairage doux et posture charismatique en boiseries d'époque.",
  },
  {
    id: 4,
    title: "Gala Prestige Lomé 2024",
    category: "Événementiel",
    src: "/event.jpg",
    description: "Atmosphère festive et lustres en cristal pour une soirée d'exception.",
  },
  {
    id: 5,
    title: "Flacon Aurora — Eau de Parfum",
    category: "Commercial",
    src: "/commercial.jpg",
    description: "Packshot publicitaire de luxe sur socle de marbre et rétroéclairage rubis.",
  },
  {
    id: 6,
    title: "Plateau Technique & Scénographie",
    category: "Studio",
    src: "/hero-studio.jpg",
    description: "Mise en scène studio avec éclairages bordeaux et caméras cinéma.",
  },
  {
    id: 7,
    title: "Laboratoire de Retouche Numérique",
    category: "Studio",
    src: "/about-photographer.jpg",
    description: "Étalonnage colorimétrique haute fidélité en direct sur moniteur calibré.",
  },
  {
    id: 8,
    title: "Valse Nocturne & Féerie",
    category: "Mariage",
    src: "/wedding.jpg",
    description: "Moments d'émotions partagés dans un cadre architectural majestueux.",
  },
  {
    id: 9,
    title: "Campagne Hivernal Haute Joaillerie",
    category: "Mode",
    src: "/fashion.jpg",
    description: "Mise en lumière des reflets et des matières nobles.",
  },
];

const categories: Category[] = [
  "Tous",
  "Mariage",
  "Mode",
  "Portrait",
  "Événementiel",
  "Commercial",
  "Studio",
];

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>(initialPortfolioItems);
  const [activeCategory, setActiveCategory] = useState<Category>("Tous");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    fetch(`${API_BASE_URL}/portfolio`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setItems(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const filteredItems =
    activeCategory === "Tous"
      ? items
      : items.filter((item) => item.category === activeCategory);

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImageIndex(null);
  };

  const nextImage = useCallback(() => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((prev) =>
      prev !== null ? (prev + 1) % filteredItems.length : 0
    );
  }, [selectedImageIndex, filteredItems.length]);

  const prevImage = useCallback(() => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((prev) =>
      prev !== null
        ? (prev - 1 + filteredItems.length) % filteredItems.length
        : 0
    );
  }, [selectedImageIndex, filteredItems.length]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex, nextImage, prevImage]);

  const currentItem =
    selectedImageIndex !== null ? filteredItems[selectedImageIndex] : null;

  return (
    <>
      {/* ===== PAGE HEADER ===== */}
      <section className="page-header" id="portfolio-header">
        <div className="container">
          <p className="page-header-subtitle">Galerie & Réalisations</p>
          <h1 className="page-header-title">Notre Portfolio</h1>
          <p className="page-header-description">
            Explorez nos créations photographiques à travers nos différents
            univers. Cliquez sur chaque cliché pour l'afficher en plein écran.
          </p>
        </div>
      </section>

      {/* ===== PORTFOLIO SECTION ===== */}
      <section className="container" id="portfolio-gallery">
        {/* Category Filters */}
        <div className="portfolio-filters">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setSelectedImageIndex(null);
              }}
              className={`filter-btn${activeCategory === cat ? " active" : ""}`}
              type="button"
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="portfolio-grid">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className="portfolio-card animate-fade-in-up"
              onClick={() => openLightbox(index)}
              tabIndex={0}
              role="button"
              aria-label={`Agrandir ${item.title}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") openLightbox(index);
              }}
            >
              <div className="portfolio-card-image">
                <Image
                  src={resolveImageUrl(item.src)}
                  alt={item.title}
                  width={600}
                  height={450}
                  loading="lazy"
                />
              </div>
              <div className="portfolio-card-overlay">
                <span className="portfolio-card-cat">{item.category}</span>
                <h3 className="portfolio-card-title">{item.title}</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px", fontSize: "0.82rem", opacity: 0.9 }}>
                  <Maximize2 size={14} />
                  <span>Agrandir</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== LIGHTBOX MODAL ===== */}
      {currentItem && (
        <div
          className="lightbox-backdrop"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="lightbox-close-btn"
              onClick={closeLightbox}
              aria-label="Fermer la visionneuse"
              type="button"
            >
              <X size={28} />
            </button>

            {/* Prev Button */}
            {filteredItems.length > 1 && (
              <button
                className="lightbox-nav-btn prev"
                onClick={prevImage}
                aria-label="Photo précédente"
                type="button"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* Image */}
            <div className="lightbox-image-holder">
              <Image
                src={resolveImageUrl(currentItem.src)}
                alt={currentItem.title}
                width={1000}
                height={750}
                priority
              />
            </div>

            {/* Next Button */}
            {filteredItems.length > 1 && (
              <button
                className="lightbox-nav-btn next"
                onClick={nextImage}
                aria-label="Photo suivante"
                type="button"
              >
                <ChevronRight size={24} />
              </button>
            )}

            {/* Captions */}
            <div className="lightbox-footer">
              <span className="lightbox-cat">
                {currentItem.category} • {(selectedImageIndex ?? 0) + 1} /{" "}
                {filteredItems.length}
              </span>
              <h2 className="lightbox-title">{currentItem.title}</h2>
              <p style={{ fontSize: "0.9rem", opacity: 0.8, marginTop: "4px" }}>
                {currentItem.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===== CTA SECTION ===== */}
      <section className="services-cta" id="portfolio-cta">
        <div className="container">
          <h2 className="section-title">Inspiré par nos réalisations ?</h2>
          <p className="services-cta-description">
            Confiez-nous votre prochain projet et créons ensemble des images à la
            hauteur de votre ambition.
          </p>
          <div className="services-cta-buttons">
            <Link href="/contact" className="btn btn-primary">
              Demander un devis sur mesure
            </Link>
            <Link href="/services" className="btn btn-outline" style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
              <span>Découvrir nos services</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
