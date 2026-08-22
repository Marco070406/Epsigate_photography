"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import type { ServiceItem } from "@/lib/types";
import { API_BASE_URL, resolveImageUrl } from "@/lib/api";

const initialServices: ServiceItem[] = [
  {
    id: "shooting-studio",
    badge: "Prestation Studio & Plein Air",
    title: "Shooting Photo (Studio & Extérieur)",
    image: "/hero-studio.jpg",
    description:
      "Une séance sur-mesure conçue pour révéler votre univers. En studio climatisé équipé de modeleurs de lumière professionnels ou en décors extérieurs à Lomé et dans tout le Togo.",
    advantages: [
      "Accompagnement stylistique et pose guidée",
      "Plateau technique professionnel climatisé",
      "Galerie privée sécurisée sous 72h",
      "Tirages d'art haute définition inclus",
    ],
    price: "À partir de 75 000 FCFA",
  },
  {
    id: "mariage",
    badge: "Célébration d'Exception",
    title: "Photographie de Mariage",
    image: "/wedding.jpg",
    description:
      "Une couverture complète et discrète de votre journée inoubliable. Des préparatifs matinaux à la soirée de gala, chaque émotion est immortalisée avec poésie et raffinement.",
    advantages: [
      "Séance d'engagement préalable offerte",
      "Reportage complet (Cérémonie civile, religieuse, réception)",
      "Coffret de luxe avec clé USB et tirages",
      "Livre photo artisanal prestige",
    ],
    price: "À partir de 450 000 FCFA",
  },
  {
    id: "mode",
    badge: "Haute Couture & Éditorial",
    title: "Photographie de Mode & Lookbook",
    image: "/fashion.jpg",
    description:
      "Sublimez vos collections de pagnes, haute couture, prêt-à-porter et joaillerie. Nous collaborons avec vos stylistes et mannequins pour créer une identité visuelle saisissante.",
    advantages: [
      "Direction artistique et moodboard personnalisés",
      "Formats adaptés pour e-commerce et campagnes print",
      "Gestion de la colorimétrie textile exacte",
      "Cession de droits d'exploitation claire",
    ],
    price: "Sur devis personnalisé",
  },
  {
    id: "portrait",
    badge: "Image de Marque & Personal Branding",
    title: "Portrait Professionnel & Corporate",
    image: "/portrait.jpg",
    description:
      "Donnez une dimension statutaire et humaine à votre communication d'entreprise, profils exécutifs, comités de direction ou trombinoscopes d'équipes à Lomé.",
    advantages: [
      "Mise en confiance rapide et naturelle",
      "Optimisation pour LinkedIn, presse et rapports annuels",
      "Shooting au studio ou directement dans vos locaux",
      "Retouche subtile respectant le naturel",
    ],
    price: "À partir de 45 000 FCFA / pers.",
  },
  {
    id: "evenementiel",
    badge: "Galas & Soirées Prestigieuses",
    title: "Couverture Événementielle",
    image: "/event.jpg",
    description:
      "Immortalisez l'ambiance de vos conférences, sommets internationaux, galas, remises de prix, lancements de produits ou soirées privées au Togo.",
    advantages: [
      "Livraison express pour vos relations presse / réseaux sociaux",
      "Discrétion absolue et élégance en toutes circonstances",
      "Option studio photocall / photocabine haut de gamme",
      "Couverture multi-photographes possible",
    ],
    price: "À partir de 250 000 FCFA / demi-journée",
  },
  {
    id: "commercial",
    badge: "Packshot & Publicité",
    title: "Photographie Produit & Commerciale",
    image: "/commercial.jpg",
    description:
      "Des visuels percutants pour vos packshots de prestige (cosmétiques, mode, agroalimentaire de luxe, hôtellerie) mettant en valeur matières et textures.",
    advantages: [
      "Éclairage macro haute précision",
      "Détourage transparent et décors d'ambiance 3D/réels",
      "Résolution ultra-haute pour affichage grand format",
      "Déclinaisons réseaux sociaux & marketplace",
    ],
    price: "Sur devis selon volume",
  },
  {
    id: "retouche",
    badge: "Post-Production d'Excellence",
    title: "Retouche & Traitement d'Images",
    image: "/about-photographer.jpg",
    description:
      "Un service dédié de retouche éditoriale, étalonnage couleur cinéma, compositing avancé et restauration de clichés précieux.",
    advantages: [
      "Retouche de peau High-End par séparation de fréquence",
      "Harmonisation de palettes et Color Grading sur mesure",
      "Nettoyage de fonds et suppression d'imperfections",
      "Export sécurisé calibré pour l'impression fine art",
    ],
    price: "À partir de 15 000 FCFA / image",
  },
];

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>(initialServices);

  useEffect(() => {
    fetch(`${API_BASE_URL}/services`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setServices(data.data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {/* ===== PAGE HEADER ===== */}
      <section className="page-header" id="services-header">
        <div className="container">
          <p className="page-header-subtitle">Nos Expertises à Lomé & International</p>
          <h1 className="page-header-title">Prestations Photographiques</h1>
          <p className="page-header-description">
            De la création de mode au grand reportage de mariage, notre studio
            à Lomé façonne chaque projet avec une exigence artisanale et une vision
            artistique contemporaine.
          </p>
        </div>
      </section>

      {/* ===== SERVICES DETAILED LIST ===== */}
      <section className="container" id="services-list">
        <div className="services-detail-list">
          {services.map((service, index) => (
            <article
              key={service.id}
              id={service.id}
              className="service-detail-item animate-fade-in-up"
            >
              <div className="service-detail-image-box">
                <Image
                  src={resolveImageUrl(service.image, "/hero-studio.jpg")}
                  alt={service.title}
                  width={650}
                  height={480}
                  priority={index < 2}
                />
              </div>

              <div>
                <span className="service-badge">{service.badge}</span>
                <h2 className="service-detail-title">{service.title}</h2>
                <p className="service-detail-text">{service.description}</p>

                {service.advantages && service.advantages.length > 0 && (
                  <>
                    <p className="service-advantages-title">Avantages inclus :</p>
                    <ul className="service-advantages-list">
                      {service.advantages.map((adv, i) => (
                        <li key={i} className="service-advantage-item">
                          <Check size={16} strokeWidth={2.5} color="var(--burgundy)" />
                          <span>{adv}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                <div className="service-price-tag">
                  <span className="service-price-label">Tarif indicatif :</span>
                  <span className="service-price-amount">{service.price}</span>
                </div>

                <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                  <Link
                    href={`/contact?service=${service.id}`}
                    className="btn btn-primary"
                  >
                    Réserver cette prestation
                  </Link>
                  <Link
                    href="/portfolio"
                    className="btn btn-outline"
                    style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}
                  >
                    <span>Voir les réalisations</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ===== FINAL SERVICES CTA ===== */}
      <section className="services-cta" id="services-cta">
        <div className="container">
          <h2 className="section-title">Besoin d'une formule sur-mesure ?</h2>
          <p className="services-cta-description">
            Nous élaborons des devis personnalisés adaptés aux contraintes
            spécifiques de votre projet, au Togo comme à l'international.
          </p>
          <div className="services-cta-buttons">
            <Link href="/contact" className="btn btn-primary" id="cta-services-quote">
              Demander un devis gratuit
            </Link>
            <Link href="/portfolio" className="btn btn-outline" id="cta-services-gallery">
              Explorer le Portfolio
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
