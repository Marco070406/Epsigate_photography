"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Award,
  Heart,
  Eye,
  ArrowRight,
} from "lucide-react";
import type { TeamMember } from "@/lib/types";
import { API_BASE_URL, resolveImageUrl } from "@/lib/api";

const values = [
  {
    icon: Sparkles,
    title: "Excellence Visuelle",
    text: "Une exigence sans compromis sur la composition, le contraste et la colorimétrie pour un rendu cinématique et luxueux.",
  },
  {
    icon: Eye,
    title: "Sensibilité & Écoute",
    text: "Comprendre votre univers et vos attentes pour créer des images qui vous ressemblent et transmettent une émotion authentique.",
  },
  {
    icon: Award,
    title: "Maîtrise Technique",
    text: "Équipement haut de gamme moyen format, façonneurs de lumière professionnels et chaîne de traitement étalonnée.",
  },
  {
    icon: Heart,
    title: "Confidentialité & Discrétion",
    text: "Un accompagnement respectueux et bienveillant, garantissant une discrétion absolue pour tous nos clients privés et corporate.",
  },
];

const initialTeam: TeamMember[] = [
  {
    id: "member-1",
    initials: "EP",
    name: "Éléonore Puget",
    role: "Fondatrice & Photographe Principale",
    bio: "Formée aux techniques de pointe de la photographie internationale, 15 ans d'expérience en mode, éditorial et reportage de mariage d'exception.",
  },
  {
    id: "member-2",
    initials: "AL",
    name: "Alexandre Laurent",
    role: "Directeur Artistique & Studio",
    bio: "Spécialiste de la scénographie lumineuse, il façonne des ambiances cinématographiques uniques pour chaque séance au studio de Lomé.",
  },
  {
    id: "member-3",
    initials: "MD",
    name: "Marc Dupont",
    role: "Expert Post-Production & Coloriste",
    bio: "Maître du compositing et du grain argentique, il peaufine chaque cliché pour une finition digne des plus grands magazines.",
  },
];

export default function AboutPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeam);

  useEffect(() => {
    fetch(`${API_BASE_URL}/team`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setTeamMembers(data.data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {/* ===== PAGE HEADER ===== */}
      <section className="page-header" id="about-header">
        <div className="container">
          <p className="page-header-subtitle">Notre Histoire & Philosophie</p>
          <h1 className="page-header-title">L'Âme d'Epsigate</h1>
          <p className="page-header-description">
            Bienvenue dans notre univers à Lomé où l'art de la photographie
            rencontre l'exigence du luxe et la spontanéité de l'émotion.
          </p>
        </div>
      </section>

      {/* ===== FOUNDER & STORY HERO ===== */}
      <section className="container" id="about-story">
        <div className="about-hero-grid">
          <div>
            <p className="page-header-subtitle">Genèse du Studio</p>
            <h2 className="section-title" style={{ textAlign: "left" }}>
              Capturer la lumière, révéler l'intemporel
            </h2>
            <p style={{ color: "var(--text-secondary)", lineHeight: "1.8", marginBottom: "16px" }}>
              Né d'une passion inconditionnelle pour le portrait et
              les jeux de clair-obscur, <strong>Epsigate Photography</strong> s'est
              imposé comme un studio de référence à <strong>Lomé, Togo</strong> et dans la sous-région ouest-africaine.
            </p>
            <p style={{ color: "var(--text-secondary)", lineHeight: "1.8" }}>
              Notre démarche repose sur une alchimie subtile : une maîtrise
              technique rigoureuse associée à une liberté créative totale. Nous
              façonnons des images vibrantes, empreintes d'élégance et de
              profondeur, destinées à traverser le temps.
            </p>

            <div className="founder-quote-box">
              « Chaque photographie est un dialogue silencieux entre la lumière,
              le sujet et l'instant suspendu. »
              <span style={{ display: "block", marginTop: "8px", fontSize: "0.88rem", fontWeight: 600, color: "var(--burgundy)" }}>
                — Éléonore Puget, Fondatrice
              </span>
            </div>
          </div>

          <div className="about-photo-wrapper">
            <Image
              src="/about-photographer.jpg"
              alt="Fondatrice et photographe d'Epsigate Photography à Lomé"
              width={700}
              height={520}
              priority
            />
          </div>
        </div>
      </section>

      {/* ===== VALUES SECTION ===== */}
      <section className="values-detailed-section" id="about-values">
        <div className="container">
          <p className="page-header-subtitle" style={{ textAlign: "center" }}>
            Nos Piliers Fondamentaux
          </p>
          <h2 className="section-title">Ce qui guide notre regard</h2>

          <div className="values-detailed-grid">
            {values.map((v, index) => {
              const IconComp = v.icon;
              return (
                <div key={index} className="value-detailed-card">
                  <div className="value-detailed-icon">
                    <IconComp size={32} strokeWidth={1.8} color="var(--burgundy)" />
                  </div>
                  <h3 className="value-detailed-title">{v.title}</h3>
                  <p className="value-detailed-text">{v.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== TEAM SECTION ===== */}
      <section className="team-section" id="about-team">
        <div className="container">
          <p className="page-header-subtitle" style={{ textAlign: "center" }}>
            Talents & Passion
          </p>
          <h2 className="section-title">L'Équipe du Studio</h2>
          <p className="section-intro-text">
            Des professionnels dévoués à la perfection de chaque projet, de la
            prise de vue initiale jusqu'au tirage d'art final.
          </p>

          <div className="team-grid">
            {teamMembers.map((member) => (
              <div key={member.id} className="team-member-card">
                <div
                  className="team-member-avatar"
                  style={{ position: "relative", overflow: "hidden" }}
                >
                  {member.photo ? (
                    <Image
                      src={resolveImageUrl(member.photo, "/portrait.jpg")}
                      alt={member.name}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="80px"
                    />
                  ) : (
                    member.initials || member.name.slice(0, 2).toUpperCase()
                  )}
                </div>
                <h3 className="team-member-name">{member.name}</h3>
                <p className="team-member-role">{member.role}</p>
                <p className="team-member-bio">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="services-cta" id="about-cta">
        <div className="container">
          <h2 className="section-title">Envie de travailler ensemble ?</h2>
          <p className="services-cta-description">
            Venez nous rencontrer à notre studio à Lomé ou échangeons autour de
            votre projet photo sur mesure.
          </p>
          <div className="contact-buttons">
            <Link href="/contact" className="btn btn-primary">
              Prendre rendez-vous
            </Link>
            <Link href="/portfolio" className="btn btn-outline" style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
              <span>Découvrir notre portfolio</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
