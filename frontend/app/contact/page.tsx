"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Sparkles,
  CheckCircle2,
  Send,
  MessageCircle,
  Globe,
  ExternalLink,
} from "lucide-react";

import { API_BASE_URL } from "@/lib/api";

export default function ContactPage() {
  const searchParams = useSearchParams();
  const serviceParam = searchParams.get("service") ?? "mariage";

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [settings, setSettings] = useState({
    studioName: "Epsigate Photography",
    address: "Boulevard du 13 Janvier, Quartier Administratif, Lomé, Togo",
    zone: "Lomé, tout le Togo, Afrique de l'Ouest & International",
    phone: "+228 90 00 00 00 / +228 22 21 00 00",
    whatsapp: "+228 90 00 00 00",
    email: "contact@epsigate-photography.com",
    weekdayHours: "Lundi – Vendredi : 08:30 – 18:30",
    saturdayHours: "Samedi : 09:00 – 18:00 (Shooting sur réservation)",
    responseDelay: "Engagement sous 24h ouvrées maximum",
    mapEmbedUrl:
      "https://maps.google.com/maps?q=6.1844304,1.1966077&z=17&ie=UTF8&iwloc=&output=embed",
    googleMapsLink: "https://maps.app.goo.gl/3oND2H3hZHEffikQ8",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    purpose: "devis",
    service: serviceParam,
    date: "",
    message: "",
    honeypot: "",
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/settings`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSettings((prev) => ({ ...prev, ...data.data }));
        }
      })
      .catch(() => {});
  }, []);

  // Sync service field when URL param changes (e.g. direct deep-link)
  useEffect(() => {
    setFormData((prev) => ({ ...prev, service: serviceParam }));
  }, [serviceParam]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(
          data.error || "Une erreur est survenue lors de l'envoi."
        );
      }
    } catch {
      setErrorMessage("Impossible de joindre le serveur. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ===== PAGE HEADER ===== */}
      <section className="page-header" id="contact-header">
        <div className="container">
          <p className="page-header-subtitle">Échangeons sur votre projet</p>
          <h1 className="page-header-title">Contact & Réservation</h1>
          <p className="page-header-description">
            Notre studio vous accueille sur rendez-vous à Lomé et se déplace
            dans tout le Togo, la sous-région et à l'international pour vos projets
            d'exception.
          </p>
        </div>
      </section>

      {/* ===== CONTACT SECTION ===== */}
      <section className="container contact-section" id="contact-content">
        <div className="contact-grid">
          {/* Informations du studio & WhatsApp */}
          <div className="contact-info">
            {/* WhatsApp Quick Chat Card */}
            <div className="whatsapp-box">
              <div className="whatsapp-box-text">
                <h2 style={{ fontSize: "1.15rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
                  Besoin d'une réponse rapide ?
                </h2>
                <p>Échangez directement avec notre équipe sur WhatsApp.</p>
              </div>
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-btn"
                id="whatsapp-direct"
              >
                <MessageCircle size={18} />
                <span>WhatsApp Direct</span>
              </a>
            </div>

            {/* Coordonnées */}
            <div className="contact-card">
              <h2 className="contact-card-title">Coordonnées du Studio</h2>
              <div className="contact-details">
                <div className="contact-item">
                  <span className="contact-item-icon">
                    <MapPin size={20} strokeWidth={1.8} />
                  </span>
                  <div>
                    <span className="contact-item-label">Adresse Principale</span>
                    <p className="contact-item-value">{settings.address}</p>
                  </div>
                </div>

                <div className="contact-item">
                  <span className="contact-item-icon">
                    <Globe size={20} strokeWidth={1.8} />
                  </span>
                  <div>
                    <span className="contact-item-label">Zone d'intervention</span>
                    <p className="contact-item-value">{settings.zone}</p>
                  </div>
                </div>

                <div className="contact-item">
                  <span className="contact-item-icon">
                    <Phone size={20} strokeWidth={1.8} />
                  </span>
                  <div>
                    <span className="contact-item-label">Téléphone / WhatsApp</span>
                    <a
                      href={`tel:${settings.phone.split("/")[0].replace(/[^0-9+]/g, "")}`}
                      className="contact-item-value"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      {settings.phone}
                    </a>
                  </div>
                </div>

                <div className="contact-item">
                  <span className="contact-item-icon">
                    <Mail size={20} strokeWidth={1.8} />
                  </span>
                  <div>
                    <span className="contact-item-label">Email Professionnel</span>
                    <a
                      href={`mailto:${settings.email}`}
                      className="contact-item-value"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      {settings.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Horaires et délais de réponse */}
            <div className="contact-card">
              <h2 className="contact-card-title">Disponibilité & Délais</h2>
              <div className="contact-details">
                <div className="contact-item">
                  <span className="contact-item-icon">
                    <Clock size={20} strokeWidth={1.8} />
                  </span>
                  <div>
                    <span className="contact-item-label">Horaires du Studio</span>
                    <p className="contact-item-value">{settings.weekdayHours}</p>
                    <p className="contact-item-value" style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                      {settings.saturdayHours}
                    </p>
                  </div>
                </div>

                <div className="contact-item">
                  <span className="contact-item-icon">
                    <Sparkles size={20} strokeWidth={1.8} />
                  </span>
                  <div>
                    <span className="contact-item-label">Délai de Réponse</span>
                    <p className="contact-item-value">{settings.responseDelay}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire de Contact & Devis */}
          <div className="contact-form-card">
            <h2 className="contact-card-title" style={{ marginBottom: "20px" }}>
              Formulaire de Contact & Devis
            </h2>

            {submitted ? (
              <div className="form-success-msg" id="contact-success">
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
                  <CheckCircle2 size={36} strokeWidth={2} color="var(--burgundy)" />
                </div>
                <h3 style={{ fontSize: "1.2rem", marginBottom: "8px", fontWeight: 600 }}>
                  Votre demande a bien été transmise !
                </h3>
                <p style={{ fontSize: "0.92rem", opacity: 0.9 }}>
                  Merci {formData.name}. L'équipe d'Epsigate Photography à Lomé vous
                  recontactera sous 24h pour finaliser votre projet.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} id="contact-form">
                {errorMessage && (
                  <div style={{ background: "rgba(220, 38, 38, 0.15)", border: "1px solid rgba(220, 38, 38, 0.4)", color: "#fca5a5", padding: "10px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.88rem" }}>
                    {errorMessage}
                  </div>
                )}

                {/* Honeypot field (hidden from normal users for anti-spam) */}
                <input
                  type="text"
                  name="honeypot"
                  value={formData.honeypot}
                  onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                  style={{ display: "none" }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="form-group">
                  <label htmlFor="purpose" className="form-label">
                    Nature de votre demande *
                  </label>
                  <select
                    id="purpose"
                    className="form-select"
                    value={formData.purpose}
                    onChange={(e) =>
                      setFormData({ ...formData, purpose: e.target.value })
                    }
                  >
                    <option value="devis">Demande de devis personnalisé</option>
                    <option value="reservation">Réservation de séance photo</option>
                    <option value="infos">Informations générales</option>
                    <option value="partenariat">Partenariat & Presse</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      placeholder="Ex. Koffi Mensah"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      placeholder="koffi@exemple.tg"
                      className="form-input"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">
                      Téléphone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      required
                      placeholder="+228 90 12 34 56"
                      className="form-input"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="service" className="form-label">
                      Prestation concernée
                    </label>
                    <select
                      id="service"
                      className="form-select"
                      value={formData.service}
                      onChange={(e) =>
                        setFormData({ ...formData, service: e.target.value })
                      }
                    >
                      <option value="studio">Shooting Photo (Studio & Extérieur)</option>
                      <option value="mariage">Photographie de Mariage</option>
                      <option value="mode">Photographie de Mode & Lookbook</option>
                      <option value="portrait">Portrait Professionnel & Corporate</option>
                      <option value="evenementiel">Couverture Événementielle</option>
                      <option value="commercial">Photographie Produit & Packshot</option>
                      <option value="retouche">Retouche & Post-Production</option>
                      <option value="autre">Autre projet sur mesure</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="date" className="form-label">
                    Date envisagée (optionnel)
                  </label>
                  <input
                    type="date"
                    id="date"
                    className="form-input"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label">
                    Détails de votre projet *
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    placeholder="Décrivez vos attentes, l'ambiance souhaitée, le lieu ou les dates clés..."
                    className="form-textarea"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary form-submit-btn"
                  id="submit-contact"
                  style={{ display: "inline-flex", gap: "10px", alignItems: "center", justifyContent: "center" }}
                >
                  <span>{loading ? "Transmission en cours..." : "Envoyer ma demande"}</span>
                  <Send size={16} strokeWidth={2} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ===== MAP & STUDIO LOCATION ===== */}
        <div className="contact-map-card">
          <div className="map-frame-wrapper">
            <iframe
              src={
                settings.mapEmbedUrl ||
                "https://maps.google.com/maps?q=6.1844304,1.1966077&z=17&ie=UTF8&iwloc=&output=embed"
              }
              title={`Localisation Google Maps de ${settings.studioName}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="map-info-floating-card">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "var(--burgundy)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(139, 29, 59, 0.4)",
                }}
              >
                <MapPin size={20} color="#ffffff" />
              </div>
              <div>
                <strong style={{ fontSize: "1.05rem", color: "#ffffff", display: "block" }}>
                  Studio {settings.studioName}
                </strong>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0 }}>
                  {settings.address}
                </p>
              </div>
            </div>

            <div style={{ marginTop: "12px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <a
                href={
                  settings.googleMapsLink ||
                  `https://maps.google.com/?q=${encodeURIComponent(
                    settings.address || "Boulevard du 13 Janvier, Lomé, Togo"
                  )}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{
                  padding: "8px 18px",
                  fontSize: "0.84rem",
                  display: "inline-flex",
                  gap: "8px",
                  alignItems: "center",
                }}
              >
                <span>Ouvrir l'itinéraire Google Maps</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
