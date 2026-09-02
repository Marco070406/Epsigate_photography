"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Phone, Mail } from "lucide-react";
import {
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
  WhatsAppIcon,
} from "./Icons";
import { API_BASE_URL } from "@/lib/api";

const DEFAULT_ADDRESS = "Boulevard du 13 Janvier, Lomé, Togo";
const DEFAULT_PHONE = "+228 90 00 00 00";
const DEFAULT_EMAIL = "contact@epsigate-photography.com";
const DEFAULT_WHATSAPP = "+22890000000";

export default function Footer() {
  const pathname = usePathname();
  const [contact, setContact] = useState({
    address: DEFAULT_ADDRESS,
    phone: DEFAULT_PHONE,
    email: DEFAULT_EMAIL,
    whatsapp: DEFAULT_WHATSAPP,
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/settings`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setContact({
            address: data.data.address || DEFAULT_ADDRESS,
            phone: data.data.phone || DEFAULT_PHONE,
            email: data.data.email || DEFAULT_EMAIL,
            whatsapp: (data.data.whatsapp || DEFAULT_WHATSAPP).replace(/[^0-9]/g, ""),
          });
        }
      })
      .catch(() => {});
  }, []);

  // Ne pas afficher le footer public sur l'espace d'administration
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <p className="footer-logo">Epsigate Photography</p>
            <p className="footer-tagline">
              Studio de photographie professionnelle & artistique à Lomé, Togo.
              Excellence visuelle, maîtrise de la lumière & créativité.
            </p>
          </div>

          <div className="footer-social-section">
            <p className="footer-section-title">Suivez-nous</p>
            <div className="footer-socials">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Instagram Epsigate"
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Facebook Epsigate"
              >
                <FacebookIcon size={18} />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="TikTok Epsigate"
              >
                <TikTokIcon size={18} />
              </a>
              <a
                href={`https://wa.me/${contact.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="WhatsApp Epsigate"
              >
                <WhatsAppIcon size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-nav-grid">
          <div className="footer-links">
            <Link href="/" className="footer-link">
              Accueil
            </Link>
            <Link href="/services" className="footer-link">
              Services
            </Link>
            <Link href="/portfolio" className="footer-link">
              Portfolio
            </Link>
            <Link href="/a-propos" className="footer-link">
              À propos
            </Link>
            <Link href="/contact" className="footer-link">
              Contact & Devis
            </Link>
          </div>

          <div className="footer-contact-mini">
            <span>
              <MapPin size={14} style={{ display: "inline", marginRight: "4px" }} />
              {contact.address}
            </span>
            <span>
              <Phone size={14} style={{ display: "inline", marginRight: "4px" }} />
              {contact.phone}
            </span>
            <span>
              <Mail size={14} style={{ display: "inline", marginRight: "4px" }} />
              {contact.email}
            </span>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy" suppressHydrationWarning>
            © {new Date().getFullYear()} Epsigate Photography - Lomé, Togo. Tous droits
            réservés. Studio de photographie d'art & commerciale.
          </p>
        </div>
      </div>
    </footer>
  );
}
