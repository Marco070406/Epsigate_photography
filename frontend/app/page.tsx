"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { imageProps } from "@/lib/api";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Camera,
  Layers,
  Star,
} from "lucide-react";
import { InstagramIcon } from "./components/Icons";

const heroSlides = [
  {
    subtitle: "Studio de photographie professionnelle - Lomé, Togo",
    titlePart1: "Excellence visuelle & ",
    titleHighlight: "créativité",
    description:
      "Chez Epsigate, nous transformons chaque instant en une œuvre intemporelle. Notre studio basé à Lomé allie savoir-faire technique de pointe et sensibilité artistique.",
    image: "/hero-studio.jpg",
    badgeCategory: "Studio & Lumière",
    badgeLabel: "Plateau professionnel - Lomé, Togo",
  },
  {
    subtitle: "Shooting Haute Couture & Lookbook",
    titlePart1: "L'art de la mode & du ",
    titleHighlight: "style",
    description:
      "Sublimez vos créations avec une direction artistique pointue, des jeux d'ombres captivants et un éclairage d'exception conçu pour marquer les esprits.",
    image: "/fashion.jpg",
    badgeCategory: "Mode & Éditorial",
    badgeLabel: "Campagnes & Lookbooks de marque",
  },
  {
    subtitle: "Portraits en studio - Lomé, Togo",
    titlePart1: "Votre personnalité, en pleine ",
    titleHighlight: "lumière",
    description:
      "Couleurs, wax, noir et blanc : nous révélons votre style avec une mise en lumière pensée pour vous, au studio de Djidjolé ou sur le lieu de votre choix.",
    image: "/portrait-wax.jpg",
    badgeCategory: "Portrait & Beauté",
    badgeLabel: "Séances en studio sur rendez-vous",
  },
  {
    subtitle: "Événements, galas & culture",
    titlePart1: "Les moments forts de vos ",
    titleHighlight: "événements",
    description:
      "Galas, concerts, défilés et célébrations : un regard discret pour immortaliser chaque instant au Togo, en Afrique de l'Ouest et à l'international.",
    image: "/togo-independance.jpg",
    badgeCategory: "Événementiel",
    badgeLabel: "Reportages au Togo et à l'international",
  },
];

const bestOfGallery = [
  {
    src: "/portrait.jpg",
    title: "Portrait fleuri",
    category: "Portrait",
  },
  {
    src: "/fashion-2.jpg",
    title: "Élégance orange",
    category: "Mode",
  },
  {
    src: "/beaute-noir-blanc.jpg",
    title: "Beauté en noir et blanc",
    category: "Beauté",
  },
  {
    src: "/concert-chorale.jpg",
    title: "Concert annuel de la chorale",
    category: "Événementiel",
  },
];

// Recent Instagram posts shown on the home page; each one links to the account
const INSTAGRAM_URL = "https://www.instagram.com/epsigate_photography";
const instagramPosts = [
  { src: "/togo-independance.jpg", alt: "Portrait au drapeau du Togo pour la fête de l'indépendance" },
  { src: "/portrait-wax.jpg", alt: "Portrait studio en tenue wax sur fond turquoise" },
  { src: "/event.jpg", alt: "Intervenante au Gala des Entrepreneurs à Lomé" },
  { src: "/fimo-haute-couture.jpg", alt: "Tenue haute couture au FIMO 228" },
  { src: "/defile-mode.jpg", alt: "Défilé de mode, costume brodé" },
  { src: "/commercial.jpg", alt: "Poteries et objets d'artisanat togolais" },
];

// Google Maps listing of the studio (rating and review shown on the home page)
const GOOGLE_REVIEWS_URL = "https://maps.app.goo.gl/rDQDhbmMX1nsQBkT9";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  // Next slide after 6 seconds; the delay restarts after a manual change
  // and autoplay pauses while the visitor hovers or focuses the slider
  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearTimeout(timer);
  }, [currentSlide, paused]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
    );
  };

  const slide = heroSlides[currentSlide];

  return (
    <>
      {/* ===== HERO SECTION WITH DYNAMIC SLIDER ===== */}
      <section
        className="hero-slider-section"
        id="hero"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div className="container">
          <div className="hero-slider-container">
            {/* Slide Content */}
            <div className="hero-slide-content animate-fade-in-up">
              {/* key: the text fades in again on every slide change */}
              <div key={currentSlide} className="hero-slide-text" aria-live="polite">
                <p className="hero-subtitle">{slide.subtitle}</p>
                <h1 className="hero-title">
                  {slide.titlePart1}
                  <span className="gradient-text">{slide.titleHighlight}</span>
                </h1>
                <p className="hero-description">{slide.description}</p>
              </div>

              <div className="hero-buttons">
                <Link href="/contact" className="btn btn-primary" id="hero-cta-book">
                  Réserver maintenant
                </Link>
                <Link
                  href="/portfolio"
                  className="btn btn-outline"
                  id="hero-cta-portfolio"
                >
                  Voir le portfolio
                </Link>
              </div>

              {/* Slider Dots & Arrows */}
              <div className="hero-slider-controls">
                <button
                  onClick={prevSlide}
                  className="slider-arrow-btn"
                  aria-label="Diapositive précédente"
                  type="button"
                >
                  <ChevronLeft size={18} />
                </button>

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  {heroSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`slider-dot${currentSlide === index ? " active" : ""}`}
                      aria-label={`Aller à la diapositive ${index + 1}`}
                      aria-current={currentSlide === index ? "true" : undefined}
                      type="button"
                    />
                  ))}
                </div>

                <button
                  onClick={nextSlide}
                  className="slider-arrow-btn"
                  aria-label="Diapositive suivante"
                  type="button"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Slide Media */}
            <div className="hero-slider-media animate-fade-in-up animate-delay-1">
              <div className="hero-image-wrapper">
                {/* All slides stay mounted and crossfade; the frame keeps a fixed ratio */}
                {heroSlides.map((s, index) => (
                  <Image
                    key={s.image}
                    src={s.image}
                    alt={index === currentSlide ? s.subtitle : ""}
                    aria-hidden={index !== currentSlide}
                    fill
                    sizes="(max-width: 768px) 100vw, 45vw"
                    priority={index === 0}
                    className={`hero-slide-image${index === currentSlide ? " is-active" : ""}`}
                  />
                ))}
                <div className="hero-badge-overlay" key={currentSlide}>
                  <span className="hero-badge-category">
                    {slide.badgeCategory}
                  </span>
                  <span>{slide.badgeLabel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ABOUT & VALUES TEASER ===== */}
      <section className="about-teaser" id="about-teaser">
        <div className="container">
          <div className="about-teaser-grid">
            <div className="about-teaser-image">
              <Image
                src="/about-photographer.jpg"
                alt="Photographe Epsigate en studio à Lomé"
                width={700}
                height={500}
              />
            </div>

            <div>
              <p className="page-header-subtitle">L’esprit Epsigate</p>
              <h2 className="section-title section-title-left">
                La passion de l’image d’exception
              </h2>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.8", marginBottom: "18px" }}>
                Fondé au cœur de <strong>Lomé, Togo</strong>, <strong>Epsigate Photography</strong> est
                un studio dédié à l’excellence visuelle et au luxe contemporain. Nous croyons que la
                lumière façonne les souvenirs et sublime les identités, qu’il
                s’agisse d’un moment de vie ou d’une marque de prestige.
              </p>

              <div className="values-grid-4">
                <div className="value-card-mini">
                  <h3 className="value-card-title">
                    <Sparkles size={18} color="var(--burgundy)" />
                    <span>Créativité</span>
                  </h3>
                  <p className="value-card-desc">
                    Direction artistique soignée et composition sur-mesure.
                  </p>
                </div>

                <div className="value-card-mini">
                  <h3 className="value-card-title">
                    <Camera size={18} color="var(--burgundy)" />
                    <span>Haute Précision</span>
                  </h3>
                  <p className="value-card-desc">
                    Matériel moyen format & optiques de pointe.
                  </p>
                </div>

                <div className="value-card-mini">
                  <h3 className="value-card-title">
                    <Layers size={18} color="var(--burgundy)" />
                    <span>Post-Production</span>
                  </h3>
                  <p className="value-card-desc">
                    Retouche colorimétrique minutieuse et fidèle.
                  </p>
                </div>

                <div className="value-card-mini">
                  <h3 className="value-card-title">
                    <ShieldCheck size={18} color="var(--burgundy)" />
                    <span>Discrétion</span>
                  </h3>
                  <p className="value-card-desc">
                    Respect absolu de la confidentialité et de vos attentes.
                  </p>
                </div>
              </div>

              <div style={{ marginTop: "28px" }}>
                <Link href="/a-propos" className="btn btn-outline" style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
                  <span>Découvrir notre histoire</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SERVICES PREVIEW ===== */}
      <section className="services-preview-section" id="services-preview">
        <div className="container">
          <p className="page-header-subtitle" style={{ textAlign: "center" }}>
            Prestations de prestige à Lomé
          </p>
          <h2 className="section-title">Nos expertises photographiques</h2>
          <p className="section-intro-text">
            Chaque shooting est pensé comme une création artistique unique,
            adaptée à vos exigences et à votre univers.
          </p>

          <div className="services-preview-grid">
            <div className="service-preview-card">
              <div className="service-preview-thumb">
                <Image
                  src="/wedding.jpg"
                  alt="Photographie de mariage"
                  width={500}
                  height={320}
                />
              </div>
              <div className="service-preview-body">
                <h3 className="service-preview-title">Mariages & Célébrations</h3>
                <p className="service-preview-text">
                  Reportage discret et élégant pour immortaliser votre grand
                  jour avec une touche cinématique et intemporelle.
                </p>
                <Link href="/services" className="service-preview-link">
                  <span>En savoir plus</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="service-preview-card">
              <div className="service-preview-thumb">
                <Image
                  src="/fashion.jpg"
                  alt="Photographie de mode"
                  width={500}
                  height={320}
                />
              </div>
              <div className="service-preview-body">
                <h3 className="service-preview-title">Mode & Lookbooks</h3>
                <p className="service-preview-text">
                  Shootings éditoriaux, catalogues et campagnes publicitaires
                  pour créateurs, stylistes et marques.
                </p>
                <Link href="/services" className="service-preview-link">
                  <span>En savoir plus</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="service-preview-card">
              <div className="service-preview-thumb">
                <Image
                  src="/portrait.jpg"
                  alt="Portrait corporate et artistique"
                  width={500}
                  height={320}
                />
              </div>
              <div className="service-preview-body">
                <h3 className="service-preview-title">Portraits & Corporate</h3>
                <p className="service-preview-text">
                  Mettez en valeur votre personnalité et votre image de marque
                  avec des portraits soignés en studio ou sur site.
                </p>
                <Link href="/services" className="service-preview-link">
                  <span>En savoir plus</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <Link href="/services" className="btn btn-primary" style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
              <span>Explorer toutes nos 7 prestations</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== BEST-OF GALLERY PREVIEW ===== */}
      <section className="home-gallery-section" id="best-of-gallery">
        <div className="container">
          <p className="page-header-subtitle" style={{ textAlign: "center" }}>
            Portfolio sélectif
          </p>
          <h2 className="section-title">Nos meilleures réalisations</h2>
          <p className="section-intro-text">
            Un aperçu de notre travail à travers différents univers
            photographiques au Togo et au-delà.
          </p>

          <div className="home-gallery-grid">
            {bestOfGallery.map((item, index) => (
              <Link
                key={index}
                href="/portfolio"
                className="home-gallery-item"
              >
                <Image
                  {...imageProps(item.src)}
                  alt={item.title}
                  width={400}
                  height={400}
                />
                <div className="home-gallery-overlay">
                  <div>
                    <span className="home-gallery-item-cat">{item.category}</span>
                    <h3 className="home-gallery-item-title">{item.title}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: "center" }}>
            <Link href="/portfolio" className="btn btn-outline" style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
              <span>Voir la galerie complète & plein écran</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== GOOGLE REVIEW ===== */}
      <section className="review-section" id="avis">
        <div className="container">
          <figure className="review-card">
            <div className="review-stars" aria-label="Note de 4,7 sur 5">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={20} fill="currentColor" strokeWidth={0} aria-hidden="true" />
              ))}
            </div>
            <blockquote className="review-quote">
              « Professionnel et bien au-delà. Il a un esprit de créativité hors pair. »
            </blockquote>
            <figcaption className="review-author">
              Romaric B. · avis Google
            </figcaption>
            <a
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="review-link"
            >
              <strong>4,7 / 5</strong> sur Google Maps · voir les avis
            </a>
          </figure>
        </div>
      </section>

      {/* ===== INSTAGRAM ===== */}
      <section className="instagram-section" id="instagram">
        <div className="container">
          <p className="page-header-subtitle" style={{ textAlign: "center" }}>
            @epsigate_photography
          </p>
          <h2 className="section-title">Suivez-nous sur Instagram</h2>
          <p className="section-intro-text">
            Coulisses, séances récentes et événements : plus de 2 000 abonnés suivent déjà notre travail.
          </p>

          <div className="instagram-grid">
            {instagramPosts.map((post) => (
              <a
                key={post.src}
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="instagram-item"
              >
                <Image src={post.src} alt={post.alt} fill sizes="(max-width: 768px) 50vw, 16vw" />
                <span className="instagram-item-overlay" aria-hidden="true">
                  <InstagramIcon size={26} />
                </span>
              </a>
            ))}
          </div>

          <div style={{ textAlign: "center" }}>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
              style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}
            >
              <InstagramIcon size={18} />
              <span>Voir le compte Instagram</span>
            </a>
          </div>
        </div>
      </section>

      {/* ===== FINAL STRATEGIC CTA ===== */}
      <section className="services-cta" id="final-cta">
        <div className="container">
          <h2 className="section-title">Prêt à donner vie à votre vision ?</h2>
          <p className="services-cta-description">
            Contactez notre studio à Lomé dès aujourd’hui pour échanger sur vos envies,
            réserver une date ou obtenir un devis personnalisé sous 24h.
          </p>
          <div className="services-cta-buttons">
            <Link href="/contact" className="btn btn-primary" id="cta-final-contact">
              Demander un devis gratuit
            </Link>
            <Link href="/services" className="btn btn-outline" id="cta-final-services">
              Consulter nos tarifs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
