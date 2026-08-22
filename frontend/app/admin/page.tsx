"use client";

import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import "./admin.css";
import {
  Lock,
  MessageSquare,
  Images,
  Settings,
  LogOut,
  CheckCircle,
  Clock,
  Trash2,
  Eye,
  Plus,
  Edit2,
  ExternalLink,
  MessageCircle,
  Mail,
  Phone,
  Save,
  X,
  Camera,
  AlertCircle,
  Search,
  Briefcase,
  Users,
  Check,
  Upload,
  MapPin,
} from "lucide-react";
import type {
  PortfolioItem,
  MessageItem,
  ServiceItem,
  TeamMember,
  SiteSettings,
  Category,
  MessageStatus,
} from "@/lib/types";

import { API_BASE_URL, uploadImage, resolveImageUrl, saveAdminToken, clearAdminToken, getAdminToken } from "@/lib/api";

/** Shorthand: headers for write requests */
function writeHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getAdminToken()}`,
  };
}

const CATEGORIES: Category[] = [
  "Tous",
  "Mariage",
  "Mode",
  "Portrait",
  "Événementiel",
  "Commercial",
  "Studio",
];

const PRESET_IMAGES = [
  { label: "Mariage Royal", value: "/wedding.jpg" },
  { label: "Mode Haute Couture", value: "/fashion.jpg" },
  { label: "Portrait Corporate", value: "/portrait.jpg" },
  { label: "Événement & Gala", value: "/event.jpg" },
  { label: "Commercial & Packshot", value: "/commercial.jpg" },
  { label: "Studio Scénographie", value: "/hero-studio.jpg" },
  { label: "Laboratoire Retouche", value: "/about-photographer.jpg" },
];

export default function AdminPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinCode, setPinCode] = useState("");
  const [authError, setAuthError] = useState("");
  const [loadingAuth, setLoadingAuth] = useState(false);

  // Active Tab: messages, services, portfolio, team, settings
  const [activeTab, setActiveTab] = useState<
    "messages" | "services" | "portfolio" | "team" | "settings"
  >("messages");

  // Data states
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // UI / Filter states
  const [messageFilter, setMessageFilter] = useState<string>("all");
  const [messageSearch, setMessageSearch] = useState("");
  const [portfolioFilter, setPortfolioFilter] = useState<Category>("Tous");
  const [selectedMessage, setSelectedMessage] = useState<MessageItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Uploading state indicators
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingService, setUploadingService] = useState(false);
  const [uploadingTeam, setUploadingTeam] = useState(false);

  // Portfolio modal state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<PortfolioItem | null>(null);
  const [photoForm, setPhotoForm] = useState({
    title: "",
    category: "Mariage" as Category,
    src: "/wedding.jpg",
    customSrc: "",
    description: "",
    featured: false,
  });

  // Services modal state
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [serviceForm, setServiceForm] = useState({
    title: "",
    badge: "",
    price: "",
    image: "/hero-studio.jpg",
    customImage: "",
    description: "",
    advantagesText: "",
  });

  // Team modal state
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [teamForm, setTeamForm] = useState({
    name: "",
    role: "",
    initials: "",
    bio: "",
    photo: "",
  });

  // PIN change state
  const [pinForm, setPinForm] = useState({ currentPin: "", newPin: "", confirmPin: "" });
  const [pinChanging, setPinChanging] = useState(false);
  const [pinChangeError, setPinChangeError] = useState("");
  const [pinChangeSuccess, setPinChangeSuccess] = useState("");

  // Check existing session
  useEffect(() => {
    const token = getAdminToken();
    const session = localStorage.getItem("epsigate_admin_session");
    if (session === "active" && token) {
      setIsAuthenticated(true);
      fetchAllData();
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const fetchAllData = async () => {
    const authHeader = writeHeaders();
    try {
      const [resMsg, resPort, resServ, resTeam, resSet] = await Promise.all([
        fetch(`${API_BASE_URL}/messages`, { headers: authHeader }),
        fetch(`${API_BASE_URL}/portfolio`),
        fetch(`${API_BASE_URL}/services`),
        fetch(`${API_BASE_URL}/team`),
        fetch(`${API_BASE_URL}/settings`),
      ]);

      if (resMsg.ok) {
        const d = await resMsg.json();
        setMessages(d.data || []);
      }
      if (resPort.ok) {
        const d = await resPort.json();
        setPortfolio(d.data || []);
      }
      if (resServ.ok) {
        const d = await resServ.json();
        setServices(d.data || []);
      }
      if (resTeam.ok) {
        const d = await resTeam.json();
        setTeam(d.data || []);
      }
      if (resSet.ok) {
        const d = await resSet.json();
        // Ensure settings is never null so the settings tab always renders
        setSettings(d.data ?? {
          studioName: "Epsigate Photography",
          tagline: "",
          address: "",
          zone: "",
          phone: "",
          whatsapp: "",
          email: "",
          weekdayHours: "",
          saturdayHours: "",
          responseDelay: "",
          heroHeadline: "",
          heroSubtitle: "",
          aboutStory: "",
        });
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoadingAuth(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: pinCode }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("epsigate_admin_session", "active");
        saveAdminToken(data.token || "");
        setIsAuthenticated(true);
        fetchAllData();
      } else {
        setAuthError(data.error || "Code d'accès incorrect");
      }
    } catch {
      setAuthError("Erreur de connexion au serveur backend");
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleLogout = () => {
    clearAdminToken();
    setIsAuthenticated(false);
  };

  // ==========================================
  // FILE UPLOAD HANDLERS
  // ==========================================
  const handlePhotoFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    const res = await uploadImage(file);
    if (res.ok && res.url) {
      setPhotoForm((prev) => ({ ...prev, src: res.url!, customSrc: res.url! }));
      showToast("Photo téléversée avec succès !");
    } else {
      showToast(res.error || "Erreur lors du téléversement");
    }
    setUploadingPhoto(false);
  };

  const handleServiceFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingService(true);
    const res = await uploadImage(file);
    if (res.ok && res.url) {
      setServiceForm((prev) => ({
        ...prev,
        image: res.url!,
        customImage: res.url!,
      }));
      showToast("Visuel de prestation téléversé !");
    } else {
      showToast(res.error || "Erreur lors du téléversement");
    }
    setUploadingService(false);
  };

  const handleTeamFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingTeam(true);
    const res = await uploadImage(file);
    if (res.ok && res.url) {
      setTeamForm((prev) => ({ ...prev, photo: res.url! }));
      showToast("Photo de profil téléversée !");
    } else {
      showToast(res.error || "Erreur lors du téléversement");
    }
    setUploadingTeam(false);
  };

  // ==========================================
  // MESSAGE ACTIONS
  // ==========================================
  const handleUpdateStatus = async (id: string, status: MessageStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/messages/${id}`, {
        method: "PATCH",
        headers: writeHeaders(),
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status } : m))
        );
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage({ ...selectedMessage, status });
        }
        showToast(`Statut mis à jour : ${status}`);
      }
    } catch {
      showToast("Erreur lors de la mise à jour");
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce message ?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/messages/${id}`, {
        method: "DELETE",
        headers: writeHeaders(),
      });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage(null);
        }
        showToast("Message supprimé");
      }
    } catch {
      showToast("Erreur lors de la suppression");
    }
  };

  // ==========================================
  // SERVICES ACTIONS
  // ==========================================
  const openAddServiceModal = () => {
    setEditingService(null);
    setServiceForm({
      title: "",
      badge: "Prestation Studio",
      price: "",
      image: "/hero-studio.jpg",
      customImage: "",
      description: "",
      advantagesText: "Accompagnement personnalisé\nMatériel professionnel\nLivraison galerie privée sécurisée",
    });
    setIsServiceModalOpen(true);
  };

  const openEditServiceModal = (item: ServiceItem) => {
    setEditingService(item);
    setServiceForm({
      title: item.title,
      badge: item.badge,
      price: item.price,
      image: item.image,
      customImage: item.image.startsWith("http") ? item.image : "",
      description: item.description,
      advantagesText: Array.isArray(item.advantages)
        ? item.advantages.join("\n")
        : "",
    });
    setIsServiceModalOpen(true);
  };

  const handleSaveService = async (e: FormEvent) => {
    e.preventDefault();
    const finalImage = serviceForm.customImage.trim() || serviceForm.image;
    const advantagesList = serviceForm.advantagesText
      .split("\n")
      .map((a) => a.trim())
      .filter(Boolean);

    if (!serviceForm.title.trim() || !serviceForm.price.trim()) {
      showToast("Veuillez remplir le titre et le tarif");
      return;
    }

    try {
      if (editingService) {
        const res = await fetch(`${API_BASE_URL}/services/${editingService.id}`, {
          method: "PUT",
          headers: writeHeaders(),
          body: JSON.stringify({
            title: serviceForm.title,
            badge: serviceForm.badge,
            price: serviceForm.price,
            image: finalImage,
            description: serviceForm.description,
            advantages: advantagesList,
          }),
        });
        if (res.ok) {
          const updated = await res.json();
          setServices((prev) =>
            prev.map((s) => (s.id === editingService.id ? updated.data : s))
          );
          setIsServiceModalOpen(false);
          showToast("Prestation mise à jour !");
        }
      } else {
        const res = await fetch(`${API_BASE_URL}/services`, {
          method: "POST",
          headers: writeHeaders(),
          body: JSON.stringify({
            title: serviceForm.title,
            badge: serviceForm.badge,
            price: serviceForm.price,
            image: finalImage,
            description: serviceForm.description,
            advantages: advantagesList,
          }),
        });
        if (res.ok) {
          const created = await res.json();
          setServices((prev) => [...prev, created.data]);
          setIsServiceModalOpen(false);
          showToast("Nouvelle prestation ajoutée !");
        }
      }
    } catch {
      showToast("Erreur lors de l'enregistrement de la prestation");
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette prestation ?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/services/${id}`, {
        method: "DELETE",
        headers: writeHeaders(),
      });
      if (res.ok) {
        setServices((prev) => prev.filter((s) => s.id !== id));
        showToast("Prestation supprimée");
      }
    } catch {
      showToast("Erreur lors de la suppression");
    }
  };

  // ==========================================
  // PORTFOLIO ACTIONS
  // ==========================================
  const openAddPhotoModal = () => {
    setEditingPhoto(null);
    setPhotoForm({
      title: "",
      category: "Mariage",
      src: "/wedding.jpg",
      customSrc: "",
      description: "",
      featured: false,
    });
    setIsPhotoModalOpen(true);
  };

  const openEditPhotoModal = (item: PortfolioItem) => {
    setEditingPhoto(item);
    setPhotoForm({
      title: item.title,
      category: item.category,
      src: item.src,
      customSrc: item.src.startsWith("http") ? item.src : "",
      description: item.description,
      featured: Boolean(item.featured),
    });
    setIsPhotoModalOpen(true);
  };

  const handleSavePhoto = async (e: FormEvent) => {
    e.preventDefault();
    const finalSrc = photoForm.customSrc.trim() || photoForm.src;

    if (!photoForm.title.trim()) {
      showToast("Veuillez saisir un titre");
      return;
    }

    try {
      if (editingPhoto) {
        const res = await fetch(`${API_BASE_URL}/portfolio/${editingPhoto.id}`, {
          method: "PUT",
          headers: writeHeaders(),
          body: JSON.stringify({
            title: photoForm.title,
            category: photoForm.category,
            src: finalSrc,
            description: photoForm.description,
            featured: photoForm.featured,
          }),
        });
        if (res.ok) {
          const updated = await res.json();
          setPortfolio((prev) =>
            prev.map((p) => (p.id === editingPhoto.id ? updated.data : p))
          );
          setIsPhotoModalOpen(false);
          showToast("Photo mise à jour avec succès");
        }
      } else {
        const res = await fetch(`${API_BASE_URL}/portfolio`, {
          method: "POST",
          headers: writeHeaders(),
          body: JSON.stringify({
            title: photoForm.title,
            category: photoForm.category,
            src: finalSrc,
            description: photoForm.description,
            featured: photoForm.featured,
          }),
        });
        if (res.ok) {
          const created = await res.json();
          setPortfolio((prev) => [created.data, ...prev]);
          setIsPhotoModalOpen(false);
          showToast("Photo ajoutée au portfolio");
        }
      }
    } catch {
      showToast("Erreur lors de l'enregistrement de la photo");
    }
  };

  const handleDeletePhoto = async (id: number) => {
    if (!confirm("Voulez-vous supprimer cette photo du portfolio ?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/portfolio/${id}`, {
        method: "DELETE",
        headers: writeHeaders(),
      });
      if (res.ok) {
        setPortfolio((prev) => prev.filter((p) => p.id !== id));
        showToast("Photo retirée du portfolio");
      }
    } catch {
      showToast("Erreur lors de la suppression");
    }
  };

  // ==========================================
  // TEAM ACTIONS
  // ==========================================
  const openAddTeamModal = () => {
    setEditingMember(null);
    setTeamForm({
      name: "",
      role: "",
      initials: "",
      bio: "",
      photo: "",
    });
    setIsTeamModalOpen(true);
  };

  const openEditTeamModal = (item: TeamMember) => {
    setEditingMember(item);
    setTeamForm({
      name: item.name,
      role: item.role,
      initials: item.initials,
      bio: item.bio,
      photo: item.photo || "",
    });
    setIsTeamModalOpen(true);
  };

  const handleSaveTeamMember = async (e: FormEvent) => {
    e.preventDefault();
    if (!teamForm.name.trim() || !teamForm.role.trim()) {
      showToast("Nom et rôle requis");
      return;
    }

    try {
      if (editingMember) {
        const res = await fetch(`${API_BASE_URL}/team/${editingMember.id}`, {
          method: "PUT",
          headers: writeHeaders(),
          body: JSON.stringify(teamForm),
        });
        if (res.ok) {
          const updated = await res.json();
          setTeam((prev) =>
            prev.map((t) => (t.id === editingMember.id ? updated.data : t))
          );
          setIsTeamModalOpen(false);
          showToast("Membre de l'équipe mis à jour !");
        }
      } else {
        const res = await fetch(`${API_BASE_URL}/team`, {
          method: "POST",
          headers: writeHeaders(),
          body: JSON.stringify(teamForm),
        });
        if (res.ok) {
          const created = await res.json();
          setTeam((prev) => [...prev, created.data]);
          setIsTeamModalOpen(false);
          showToast("Nouveau membre ajouté à l'équipe !");
        }
      }
    } catch {
      showToast("Erreur lors de l'enregistrement du membre");
    }
  };

  const handleDeleteTeamMember = async (id: string) => {
    if (!confirm("Voulez-vous retirer ce membre de l'équipe ?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/team/${id}`, {
        method: "DELETE",
        headers: writeHeaders(),
      });
      if (res.ok) {
        setTeam((prev) => prev.filter((t) => t.id !== id));
        showToast("Membre retiré de l'équipe");
      }
    } catch {
      showToast("Erreur lors de la suppression");
    }
  };

  // ==========================================
  // SETTINGS ACTIONS
  // ==========================================
  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      const res = await fetch(`${API_BASE_URL}/settings`, {
        method: "POST",
        headers: writeHeaders(),
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        showToast("Paramètres du studio enregistrés !");
      }
    } catch {
      showToast("Erreur lors de l'enregistrement");
    }
  };

  const handleChangePin = async (e: FormEvent) => {
    e.preventDefault();
    setPinChangeError("");
    setPinChangeSuccess("");

    if (pinForm.newPin !== pinForm.confirmPin) {
      setPinChangeError("Les deux nouveaux codes ne correspondent pas.");
      return;
    }
    if (pinForm.newPin.length < 6) {
      setPinChangeError("Le nouveau code doit contenir au moins 6 caractères.");
      return;
    }

    setPinChanging(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/change-pin`, {
        method: "POST",
        headers: writeHeaders(),
        body: JSON.stringify({
          currentPin: pinForm.currentPin,
          newPin: pinForm.newPin,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPinChangeSuccess("Code PIN mis à jour avec succès. Vous allez être déconnecté.");
        setPinForm({ currentPin: "", newPin: "", confirmPin: "" });
        // Force re-login after 2s since the token is now invalid
        setTimeout(() => {
          clearAdminToken();
          setIsAuthenticated(false);
        }, 2000);
      } else {
        setPinChangeError(data.error || "Erreur lors du changement de code.");
      }
    } catch {
      setPinChangeError("Impossible de joindre le serveur.");
    } finally {
      setPinChanging(false);
    }
  };

  // Filtered Messages
  const filteredMessages = messages.filter((m) => {
    const matchStatus =
      messageFilter === "all" ? true : m.status === messageFilter;
    const matchSearch =
      m.name.toLowerCase().includes(messageSearch.toLowerCase()) ||
      m.email.toLowerCase().includes(messageSearch.toLowerCase()) ||
      m.service.toLowerCase().includes(messageSearch.toLowerCase()) ||
      m.message.toLowerCase().includes(messageSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Filtered Portfolio
  const filteredPortfolio =
    portfolioFilter === "Tous"
      ? portfolio
      : portfolio.filter((p) => p.category === portfolioFilter);

  const unreadMessagesCount = messages.filter((m) => m.status === "nouveau").length;

  // 1. LOCK SCREEN
  if (!isAuthenticated) {
    return (
      <div className="admin-auth-container">
        <div className="admin-auth-card">
          <div className="admin-auth-icon">
            <Lock size={28} />
          </div>
          <h1 className="admin-auth-title">Epsigate Photography</h1>
          <p className="admin-auth-desc">
            Accès sécurisé réservé à l'équipe d'administration du studio.
          </p>

          <form onSubmit={handleLogin} className="admin-auth-form">
            {authError && (
              <div className="admin-auth-error">
                <AlertCircle size={18} />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="admin-pin"
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  color: "#d1cbd0",
                  marginBottom: "6px",
                }}
              >
                Code d'accès administrateur
              </label>
              <input
                id="admin-pin"
                type="password"
                required
                placeholder="Entrez votre code d'accès"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                className="form-input-admin"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loadingAuth}
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", marginTop: "10px" }}
            >
              {loadingAuth ? "Vérification..." : "Déverrouiller l'administration"}
            </button>
          </form>

          <div style={{ marginTop: "24px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px" }}>
            <Link
              href="/"
              style={{
                color: "#a39ba2",
                fontSize: "0.86rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>← Retour au site public</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED DASHBOARD
  return (
    <div className="admin-wrapper">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="admin-toast">
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Top Header */}
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-brand">
            <div className="admin-logo-badge">EP</div>
            <div className="admin-brand-text">
              <h1>Epsigate Photography</h1>
              <span>Administration Studio</span>
            </div>
          </div>

          <nav className="admin-nav-tabs">
            <button
              onClick={() => setActiveTab("messages")}
              className={`admin-tab-btn ${activeTab === "messages" ? "active" : ""}`}
            >
              <MessageSquare size={16} />
              <span>Messages & Devis</span>
              {unreadMessagesCount > 0 && (
                <span className="tab-badge">{unreadMessagesCount}</span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("services")}
              className={`admin-tab-btn ${activeTab === "services" ? "active" : ""}`}
            >
              <Briefcase size={16} />
              <span>Services & Tarifs ({services.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("portfolio")}
              className={`admin-tab-btn ${activeTab === "portfolio" ? "active" : ""}`}
            >
              <Images size={16} />
              <span>Portfolio ({portfolio.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("team")}
              className={`admin-tab-btn ${activeTab === "team" ? "active" : ""}`}
            >
              <Users size={16} />
              <span>L'Équipe ({team.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`admin-tab-btn ${activeTab === "settings" ? "active" : ""}`}
            >
              <Settings size={16} />
              <span>Paramètres</span>
            </button>
          </nav>

          <div className="admin-header-actions">
            <Link
              href="/"
              className="icon-btn"
              title="Voir le site public"
            >
              <ExternalLink size={16} />
            </Link>
            <button
              onClick={handleLogout}
              className="icon-btn danger"
              title="Déconnexion"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Body */}
      <main className="admin-main">
        {/* ========================================================================= */}
        {/* TAB 1: MESSAGES & DEVIS */}
        {/* ========================================================================= */}
        {activeTab === "messages" && (
          <div>
            <div className="admin-toolbar">
              <div className="admin-search-box">
                <Search size={16} color="#a39ba2" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email, prestation..."
                  value={messageSearch}
                  onChange={(e) => setMessageSearch(e.target.value)}
                />
              </div>

              <div className="admin-filter-group">
                <button
                  onClick={() => setMessageFilter("all")}
                  className={`filter-chip ${messageFilter === "all" ? "active" : ""}`}
                >
                  Tous ({messages.length})
                </button>
                <button
                  onClick={() => setMessageFilter("nouveau")}
                  className={`filter-chip ${messageFilter === "nouveau" ? "active" : ""}`}
                >
                  Nouveaux ({unreadMessagesCount})
                </button>
                <button
                  onClick={() => setMessageFilter("traité")}
                  className={`filter-chip ${messageFilter === "traité" ? "active" : ""}`}
                >
                  Traités
                </button>
                <button
                  onClick={() => setMessageFilter("archivé")}
                  className={`filter-chip ${messageFilter === "archivé" ? "active" : ""}`}
                >
                  Archivés
                </button>
              </div>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Expéditeur</th>
                    <th>Nature & Service</th>
                    <th>Téléphone</th>
                    <th>Message</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMessages.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#a39ba2" }}>
                        Aucun message ne correspond à vos critères.
                      </td>
                    </tr>
                  ) : (
                    filteredMessages.map((msg) => (
                      <tr key={msg.id}>
                        <td style={{ color: "#a39ba2", whiteSpace: "nowrap" }}>
                          {new Date(msg.createdAt).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td>
                          <strong style={{ color: "#ffffff" }}>{msg.name}</strong>
                          <div style={{ fontSize: "0.8rem", color: "#a39ba2" }}>
                            {msg.email}
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              background: "rgba(212, 175, 55, 0.12)",
                              color: "#f3e5ab",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              textTransform: "capitalize",
                            }}
                          >
                            {msg.service}
                          </span>
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>{msg.phone}</td>
                        <td
                          style={{
                            maxWidth: "240px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            color: "#d1cbd0",
                          }}
                        >
                          {msg.message}
                        </td>
                        <td>
                          <select
                            value={msg.status}
                            onChange={(e) =>
                              handleUpdateStatus(
                                msg.id,
                                e.target.value as MessageStatus
                              )
                            }
                            className="form-select-admin"
                            style={{ padding: "4px 8px", fontSize: "0.78rem" }}
                          >
                            <option value="nouveau">Nouveau</option>
                            <option value="traité">Traité</option>
                            <option value="archivé">Archivé</option>
                          </select>
                        </td>
                        <td>
                          <div className="action-btn-group">
                            <button
                              onClick={() => setSelectedMessage(msg)}
                              className="icon-btn"
                              title="Lire le message complet"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="icon-btn danger"
                              title="Supprimer"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SERVICES & TARIFS */}
        {/* ========================================================================= */}
        {activeTab === "services" && (
          <div>
            <div className="admin-toolbar">
              <div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#ffffff" }}>
                  Gestion des Prestations Photographiques
                </h2>
                <p style={{ fontSize: "0.85rem", color: "#a39ba2" }}>
                  Ajoutez, téléversez des visuels et ajustez les tarifs en direct.
                </p>
              </div>

              <button
                onClick={openAddServiceModal}
                className="btn btn-primary"
                style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}
              >
                <Plus size={16} />
                <span>Ajouter une prestation</span>
              </button>
            </div>

            <div className="admin-gallery-grid">
              {services.map((service) => (
                <div key={service.id} className="admin-photo-card">
                  <div className="admin-photo-thumb">
                    <Image
                      src={resolveImageUrl(service.image, "/hero-studio.jpg")}
                      alt={service.title}
                      fill
                      sizes="320px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className="admin-photo-body">
                    <div className="admin-photo-cat">{service.badge}</div>
                    <h3 className="admin-photo-title">{service.title}</h3>
                    <div
                      style={{
                        fontWeight: 700,
                        color: "#d4af37",
                        fontSize: "0.95rem",
                        marginBottom: "8px",
                      }}
                    >
                      {service.price}
                    </div>
                    <p className="admin-photo-desc">{service.description}</p>

                    {service.advantages && service.advantages.length > 0 && (
                      <div
                        style={{
                          background: "rgba(0,0,0,0.25)",
                          padding: "10px",
                          borderRadius: "6px",
                          marginBottom: "12px",
                          fontSize: "0.78rem",
                          color: "#d1cbd0",
                        }}
                      >
                        <strong>Inclusions :</strong>
                        <ul style={{ paddingLeft: "16px", marginTop: "4px" }}>
                          {service.advantages.slice(0, 3).map((adv, idx) => (
                            <li key={idx}>{adv}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="admin-photo-actions">
                      <span style={{ fontSize: "0.75rem", color: "#a39ba2" }}>
                        ID: {service.id}
                      </span>
                      <div className="action-btn-group">
                        <button
                          onClick={() => openEditServiceModal(service)}
                          className="icon-btn"
                          title="Modifier la prestation"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className="icon-btn danger"
                          title="Supprimer la prestation"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PORTFOLIO / GALERIE */}
        {/* ========================================================================= */}
        {activeTab === "portfolio" && (
          <div>
            <div className="admin-toolbar">
              <div className="admin-filter-group">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPortfolioFilter(cat)}
                    className={`filter-chip ${portfolioFilter === cat ? "active" : ""}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                onClick={openAddPhotoModal}
                className="btn btn-primary"
                style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}
              >
                <Plus size={16} />
                <span>Ajouter une photo</span>
              </button>
            </div>

            <div className="admin-gallery-grid">
              {filteredPortfolio.map((item) => (
                <div key={item.id} className="admin-photo-card">
                  <div className="admin-photo-thumb">
                    <Image
                      src={resolveImageUrl(item.src, "/wedding.jpg")}
                      alt={item.title}
                      fill
                      sizes="300px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className="admin-photo-body">
                    <div className="admin-photo-cat">{item.category}</div>
                    <h3 className="admin-photo-title">{item.title}</h3>
                    <p className="admin-photo-desc">{item.description}</p>
                    <div className="admin-photo-actions">
                      <span style={{ fontSize: "0.75rem", color: "#a39ba2" }}>
                        ID: #{item.id}
                      </span>
                      <div className="action-btn-group">
                        <button
                          onClick={() => openEditPhotoModal(item)}
                          className="icon-btn"
                          title="Modifier les informations"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeletePhoto(item.id)}
                          className="icon-btn danger"
                          title="Supprimer de la galerie"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: L'ÉQUIPE DU STUDIO */}
        {/* ========================================================================= */}
        {activeTab === "team" && (
          <div>
            <div className="admin-toolbar">
              <div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#ffffff" }}>
                  Membres de l'Équipe & Photographes
                </h2>
                <p style={{ fontSize: "0.85rem", color: "#a39ba2" }}>
                  Téléversez des portraits ou renseignez des biographies pour la page À propos.
                </p>
              </div>

              <button
                onClick={openAddTeamModal}
                className="btn btn-primary"
                style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}
              >
                <Plus size={16} />
                <span>Ajouter un membre</span>
              </button>
            </div>

            <div className="admin-gallery-grid">
              {team.map((member) => (
                <div key={member.id} className="admin-photo-card" style={{ padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
                    <div
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #8B1D3B, #530f21)",
                        border: "1px solid rgba(212, 175, 55, 0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#f3e5ab",
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        fontFamily: "var(--font-cormorant, serif)",
                        flexShrink: 0,
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      {member.photo ? (
                        <Image
                          src={resolveImageUrl(member.photo, "/portrait.jpg")}
                          alt={member.name}
                          fill
                          sizes="60px"
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        member.initials || member.name.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: "#ffffff" }}>
                        {member.name}
                      </h3>
                      <span style={{ fontSize: "0.8rem", color: "#d4af37" }}>
                        {member.role}
                      </span>
                    </div>
                  </div>

                  <p
                    style={{
                      fontSize: "0.84rem",
                      color: "#a39ba2",
                      lineHeight: 1.5,
                      flex: 1,
                      marginBottom: "16px",
                    }}
                  >
                    {member.bio}
                  </p>

                  <div className="admin-photo-actions" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
                    <span style={{ fontSize: "0.75rem", color: "#a39ba2" }}>
                      ID: {member.id}
                    </span>
                    <div className="action-btn-group">
                      <button
                        onClick={() => openEditTeamModal(member)}
                        className="icon-btn"
                        title="Modifier le membre"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteTeamMember(member.id)}
                        className="icon-btn danger"
                        title="Retirer le membre"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: SETTINGS & COORDONNÉES */}
        {/* ========================================================================= */}
        {activeTab === "settings" && settings && (
          <div>
            <form onSubmit={handleSaveSettings}>
              <div className="settings-grid">
              {/* Card 1: Coordonnées & Contact */}
              <div className="settings-card">
                <h2 className="admin-card-title" style={{ marginBottom: "20px" }}>
                  <Phone size={18} color="#d4af37" />
                  <span>Coordonnées & Canaux Directs</span>
                </h2>

                <div className="form-group-admin">
                  <label className="form-label-admin">Nom du Studio</label>
                  <input
                    type="text"
                    value={settings.studioName}
                    onChange={(e) =>
                      setSettings({ ...settings, studioName: e.target.value })
                    }
                    className="form-input-admin"
                  />
                </div>

                <div className="form-group-admin">
                  <label className="form-label-admin">Téléphone / Standard</label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) =>
                      setSettings({ ...settings, phone: e.target.value })
                    }
                    className="form-input-admin"
                  />
                </div>

                <div className="form-group-admin">
                  <label className="form-label-admin">Numéro WhatsApp Direct</label>
                  <input
                    type="text"
                    value={settings.whatsapp}
                    onChange={(e) =>
                      setSettings({ ...settings, whatsapp: e.target.value })
                    }
                    className="form-input-admin"
                  />
                </div>

                <div className="form-group-admin">
                  <label className="form-label-admin">Email Professionnel</label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) =>
                      setSettings({ ...settings, email: e.target.value })
                    }
                    className="form-input-admin"
                  />
                </div>

                <div className="form-group-admin">
                  <label className="form-label-admin">Adresse Principale (Lomé)</label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) =>
                      setSettings({ ...settings, address: e.target.value })
                    }
                    className="form-input-admin"
                  />
                </div>

                <div className="form-group-admin">
                  <label className="form-label-admin">Zone d'intervention</label>
                  <input
                    type="text"
                    value={settings.zone}
                    onChange={(e) =>
                      setSettings({ ...settings, zone: e.target.value })
                    }
                    className="form-input-admin"
                  />
                </div>
              </div>

              {/* Card 2: Horaires & Textes */}
              <div className="settings-card">
                <h2 className="admin-card-title" style={{ marginBottom: "20px" }}>
                  <Clock size={18} color="#d4af37" />
                  <span>Horaires & Présentation</span>
                </h2>

                <div className="form-group-admin">
                  <label className="form-label-admin">Horaires Semaine (Lun - Ven)</label>
                  <input
                    type="text"
                    value={settings.weekdayHours}
                    onChange={(e) =>
                      setSettings({ ...settings, weekdayHours: e.target.value })
                    }
                    className="form-input-admin"
                  />
                </div>

                <div className="form-group-admin">
                  <label className="form-label-admin">Horaires Samedi & Weekend</label>
                  <input
                    type="text"
                    value={settings.saturdayHours}
                    onChange={(e) =>
                      setSettings({ ...settings, saturdayHours: e.target.value })
                    }
                    className="form-input-admin"
                  />
                </div>

                <div className="form-group-admin">
                  <label className="form-label-admin">Engagement délai de réponse</label>
                  <input
                    type="text"
                    value={settings.responseDelay}
                    onChange={(e) =>
                      setSettings({ ...settings, responseDelay: e.target.value })
                    }
                    className="form-input-admin"
                  />
                </div>

                <div className="form-group-admin">
                  <label className="form-label-admin">Slogan / Sous-titre principal</label>
                  <input
                    type="text"
                    value={settings.tagline}
                    onChange={(e) =>
                      setSettings({ ...settings, tagline: e.target.value })
                    }
                    className="form-input-admin"
                  />
                </div>

                <div className="form-group-admin">
                  <label className="form-label-admin">Titre Hero Accueil</label>
                  <input
                    type="text"
                    value={settings.heroHeadline}
                    onChange={(e) =>
                      setSettings({ ...settings, heroHeadline: e.target.value })
                    }
                    className="form-input-admin"
                  />
                </div>

                <div className="form-group-admin">
                  <label className="form-label-admin">Texte d'introduction Hero</label>
                  <textarea
                    rows={3}
                    value={settings.heroSubtitle}
                    onChange={(e) =>
                      setSettings({ ...settings, heroSubtitle: e.target.value })
                    }
                    className="form-textarea-admin"
                  />
                </div>
              </div>

              {/* Card 3: Localisation & Carte Google Maps */}
              <div className="settings-card" style={{ gridColumn: "1 / -1" }}>
                <h2 className="admin-card-title" style={{ marginBottom: "20px" }}>
                  <MapPin size={18} color="#d4af37" />
                  <span>Localisation & Carte Interactive (Google Maps)</span>
                </h2>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div>
                    <div className="form-group-admin">
                      <label className="form-label-admin">Lien direct d'itinéraire (Google Maps)</label>
                      <input
                        type="text"
                        placeholder="https://maps.google.com/?q=..."
                        value={settings.googleMapsLink || ""}
                        onChange={(e) =>
                          setSettings({ ...settings, googleMapsLink: e.target.value })
                        }
                        className="form-input-admin"
                      />
                    </div>

                    <div className="form-group-admin">
                      <label className="form-label-admin">URL d'intégration de la carte (Iframe / Embed)</label>
                      <div style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
                        <input
                          type="text"
                          placeholder="https://maps.google.com/maps?q=...&output=embed"
                          value={settings.mapEmbedUrl || ""}
                          onChange={(e) =>
                            setSettings({ ...settings, mapEmbedUrl: e.target.value })
                          }
                          className="form-input-admin"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const query = encodeURIComponent(
                              settings.address || "Lomé, Togo"
                            );
                            const generatedEmbed = `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
                            const generatedLink = `https://maps.google.com/?q=${query}`;
                            setSettings({
                              ...settings,
                              mapEmbedUrl: generatedEmbed,
                              googleMapsLink: generatedLink,
                            });
                            showToast("Carte synchronisée avec l'adresse !");
                          }}
                          className="btn btn-outline"
                          style={{ whiteSpace: "nowrap", padding: "8px 14px", fontSize: "0.8rem" }}
                          title="Générer automatiquement depuis l'adresse saisie"
                        >
                          Auto-Générer
                        </button>
                      </div>
                      <span style={{ fontSize: "0.76rem", color: "#a39ba2" }}>
                        Cliquez sur &quot;Auto-Générer&quot; pour calculer la carte à partir de l&apos;adresse du studio.
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="form-label-admin">Aperçu en direct de la carte :</label>
                    <div
                      style={{
                        height: "180px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: "1px solid rgba(212, 175, 55, 0.3)",
                        background: "rgba(0,0,0,0.4)",
                      }}
                    >
                      <iframe
                        src={
                          settings.mapEmbedUrl ||
                          `https://maps.google.com/maps?q=${encodeURIComponent(
                            settings.address || "Lomé, Togo"
                          )}&t=&z=15&ie=UTF8&iwloc=&output=embed`
                        }
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ display: "inline-flex", gap: "10px", alignItems: "center" }}
              >
                <Save size={18} />
                <span>Enregistrer les paramètres</span>
              </button>
            </div>
            </form>
          {/* CARD: CHANGEMENT DU CODE PIN ADMIN */}
          
          <div className="settings-card" style={{ marginTop: "28px" }}>
            <h2 className="admin-card-title" style={{ marginBottom: "20px" }}>
              <Lock size={18} color="#d4af37" />
              <span>Sécurité — Changer le Code PIN Administrateur</span>
            </h2>

            <form onSubmit={handleChangePin}>
              {pinChangeError && (
                <div style={{ background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.4)", color: "#fca5a5", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "8px" }}>
                  <AlertCircle size={16} />
                  <span>{pinChangeError}</span>
                </div>
              )}
              {pinChangeSuccess && (
                <div style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.4)", color: "#6ee7b7", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Check size={16} />
                  <span>{pinChangeSuccess}</span>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div className="form-group-admin">
                  <label className="form-label-admin">Code actuel</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={pinForm.currentPin}
                    onChange={(e) => setPinForm({ ...pinForm, currentPin: e.target.value })}
                    className="form-input-admin"
                    autoComplete="current-password"
                  />
                </div>
                <div className="form-group-admin">
                  <label className="form-label-admin">Nouveau code (min. 6 car.)</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={pinForm.newPin}
                    onChange={(e) => setPinForm({ ...pinForm, newPin: e.target.value })}
                    className="form-input-admin"
                    autoComplete="new-password"
                  />
                </div>
                <div className="form-group-admin">
                  <label className="form-label-admin">Confirmer le nouveau code</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={pinForm.confirmPin}
                    onChange={(e) => setPinForm({ ...pinForm, confirmPin: e.target.value })}
                    className="form-input-admin"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                <button
                  type="submit"
                  disabled={pinChanging}
                  className="btn btn-primary"
                  style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}
                >
                  <Lock size={16} />
                  <span>{pinChanging ? "Mise à jour..." : "Changer le code PIN"}</span>
                </button>
              </div>
            </form>
          </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL: MESSAGE DETAIL */}
      {/* ========================================================================= */}
      {selectedMessage && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setSelectedMessage(null)}
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Demande de {selectedMessage.name}</h2>
              <button
                onClick={() => setSelectedMessage(null)}
                className="icon-btn"
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  background: "rgba(0,0,0,0.3)",
                  padding: "16px",
                  borderRadius: "10px",
                }}
              >
                <div>
                  <span style={{ fontSize: "0.78rem", color: "#a39ba2" }}>Email</span>
                  <div style={{ fontWeight: 600, color: "#ffffff" }}>
                    {selectedMessage.email}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "0.78rem", color: "#a39ba2" }}>Téléphone</span>
                  <div style={{ fontWeight: 600, color: "#ffffff" }}>
                    {selectedMessage.phone}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "0.78rem", color: "#a39ba2" }}>Prestation</span>
                  <div style={{ textTransform: "capitalize", color: "#f3e5ab" }}>
                    {selectedMessage.service}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "0.78rem", color: "#a39ba2" }}>Date prévue</span>
                  <div style={{ color: "#ffffff" }}>
                    {selectedMessage.date || "Non spécifiée"}
                  </div>
                </div>
              </div>

              <div>
                <label className="form-label-admin">Message complet :</label>
                <div
                  style={{
                    background: "rgba(0,0,0,0.4)",
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.06)",
                    lineHeight: 1.6,
                    color: "#f3f3f5",
                    fontSize: "0.92rem",
                  }}
                >
                  {selectedMessage.message}
                </div>
              </div>

              {/* Direct Reply Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  paddingTop: "10px",
                }}
              >
                <a
                  href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{
                    display: "inline-flex",
                    gap: "8px",
                    alignItems: "center",
                    flex: 1,
                    justifyContent: "center",
                  }}
                >
                  <MessageCircle size={16} />
                  <span>Répondre sur WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    const subject = encodeURIComponent(
                      `Epsigate Photography - Votre demande : ${selectedMessage.service}`
                    );
                    const body = encodeURIComponent(
                      `Bonjour ${selectedMessage.name},\n\nMerci pour votre demande concernant "${selectedMessage.service}".\n\nNous avons bien pris en compte votre message et nous revenons vers vous dans les plus brefs delais.\n\nCordialement,\nL'equipe Epsigate Photography\nLome, Togo`
                    );
                    window.location.href = `mailto:${selectedMessage.email}?subject=${subject}&body=${body}`;
                  }}
                  className="btn btn-outline"
                  style={{
                    display: "inline-flex",
                    gap: "8px",
                    alignItems: "center",
                    flex: 1,
                    justifyContent: "center",
                  }}
                >
                  <Mail size={16} />
                  <span>Répondre par Email</span>
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: "14px",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => handleUpdateStatus(selectedMessage.id, "traité")}
                    className="filter-chip"
                    style={{
                      background: "rgba(16,185,129,0.2)",
                      borderColor: "#10b981",
                      color: "#6ee7b7",
                    }}
                  >
                    Marquer Traité
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedMessage.id, "archivé")}
                    className="filter-chip"
                  >
                    Archiver
                  </button>
                </div>

                <button
                  onClick={() => handleDeleteMessage(selectedMessage.id)}
                  className="icon-btn danger"
                  title="Supprimer ce message"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT SERVICE (WITH FILE UPLOAD) */}
      {/* ========================================================================= */}
      {isServiceModalOpen && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setIsServiceModalOpen(false)}
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingService ? "Modifier la prestation" : "Ajouter une nouvelle prestation"}
              </h2>
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="icon-btn"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveService}>
              <div className="form-group-admin">
                <label className="form-label-admin">Titre de la prestation *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex. Shooting Portrait Dirigeant"
                  value={serviceForm.title}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, title: e.target.value })
                  }
                  className="form-input-admin"
                />
              </div>

              <div className="form-group-admin">
                <label className="form-label-admin">Badge / Catégorie</label>
                <input
                  type="text"
                  placeholder="Ex. Image de Marque & Corporate"
                  value={serviceForm.badge}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, badge: e.target.value })
                  }
                  className="form-input-admin"
                />
              </div>

              <div className="form-group-admin">
                <label className="form-label-admin">Tarif indicatif *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex. À partir de 75 000 FCFA ou Sur devis"
                  value={serviceForm.price}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, price: e.target.value })
                  }
                  className="form-input-admin"
                />
              </div>

              {/* UPLOAD ZONE FOR SERVICE */}
              <div className="form-group-admin">
                <label className="form-label-admin">Visuel de la prestation</label>
                
                <div className="upload-box">
                  <input
                    type="file"
                    id="service-upload-input"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleServiceFileUpload}
                  />
                  <label htmlFor="service-upload-input" className="upload-btn-label">
                    <Upload size={16} />
                    <span>
                      {uploadingService
                        ? "Téléversement en cours..."
                        : "Téléverser depuis votre appareil"}
                    </span>
                  </label>
                  <span style={{ fontSize: "0.76rem", color: "#a39ba2" }}>
                    Formats acceptés : JPG, PNG, WebP (Max. 15 Mo)
                  </span>
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.78rem", color: "#a39ba2" }}>Ou choisir un visuel prédéfini :</span>
                </div>

                <select
                  value={serviceForm.image}
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      image: e.target.value,
                      customImage: "",
                    })
                  }
                  className="form-select-admin"
                  style={{ marginBottom: "8px" }}
                >
                  {PRESET_IMAGES.map((img) => (
                    <option key={img.value} value={img.value}>
                      {img.label} ({img.value})
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Ou URL externe (https://...)"
                  value={serviceForm.customImage}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, customImage: e.target.value })
                  }
                  className="form-input-admin"
                />
              </div>

              {/* Live Preview */}
              <div style={{ marginBottom: "16px" }}>
                <label className="form-label-admin">Aperçu du visuel :</label>
                <div
                  style={{
                    height: "140px",
                    position: "relative",
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid rgba(212,175,55,0.3)",
                  }}
                >
                  <Image
                    src={resolveImageUrl(serviceForm.customImage || serviceForm.image, "/hero-studio.jpg")}
                    alt="Aperçu"
                    fill
                    sizes="400px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </div>

              <div className="form-group-admin">
                <label className="form-label-admin">Description de l'offre</label>
                <textarea
                  rows={3}
                  placeholder="Description détaillée de l'expérience et du déroulement..."
                  value={serviceForm.description}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, description: e.target.value })
                  }
                  className="form-textarea-admin"
                />
              </div>

              <div className="form-group-admin">
                <label className="form-label-admin">
                  Inclusions & Avantages (1 par ligne)
                </label>
                <textarea
                  rows={3}
                  placeholder="Tirages d'art inclus&#10;Galerie privée sous 72h&#10;Accompagnement stylistique"
                  value={serviceForm.advantagesText}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, advantagesText: e.target.value })
                  }
                  className="form-textarea-admin"
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "20px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="btn btn-outline"
                >
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingService ? "Enregistrer les modifications" : "Créer la prestation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT PHOTO (WITH FILE UPLOAD) */}
      {/* ========================================================================= */}
      {isPhotoModalOpen && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setIsPhotoModalOpen(false)}
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingPhoto ? "Modifier la photo" : "Ajouter une nouvelle photo"}
              </h2>
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="icon-btn"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePhoto}>
              <div className="form-group-admin">
                <label className="form-label-admin">Titre de l'œuvre *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex. Noces d'Or au Palais des Congrès"
                  value={photoForm.title}
                  onChange={(e) =>
                    setPhotoForm({ ...photoForm, title: e.target.value })
                  }
                  className="form-input-admin"
                />
              </div>

              <div className="form-group-admin">
                <label className="form-label-admin">Catégorie *</label>
                <select
                  value={photoForm.category}
                  onChange={(e) =>
                    setPhotoForm({
                      ...photoForm,
                      category: e.target.value as Category,
                    })
                  }
                  className="form-select-admin"
                >
                  {CATEGORIES.filter((c) => c !== "Tous").map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* UPLOAD ZONE FOR PORTFOLIO */}
              <div className="form-group-admin">
                <label className="form-label-admin">Image photographique</label>
                
                <div className="upload-box">
                  <input
                    type="file"
                    id="portfolio-upload-input"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handlePhotoFileUpload}
                  />
                  <label htmlFor="portfolio-upload-input" className="upload-btn-label">
                    <Upload size={16} />
                    <span>
                      {uploadingPhoto
                        ? "Téléversement en cours..."
                        : "Téléverser depuis votre appareil"}
                    </span>
                  </label>
                  <span style={{ fontSize: "0.76rem", color: "#a39ba2" }}>
                    Formats acceptés : JPG, PNG, WebP (Max. 15 Mo)
                  </span>
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.78rem", color: "#a39ba2" }}>Ou choisir parmi les presets :</span>
                </div>

                <select
                  value={photoForm.src}
                  onChange={(e) =>
                    setPhotoForm({
                      ...photoForm,
                      src: e.target.value,
                      customSrc: "",
                    })
                  }
                  className="form-select-admin"
                  style={{ marginBottom: "8px" }}
                >
                  {PRESET_IMAGES.map((img) => (
                    <option key={img.value} value={img.value}>
                      {img.label} ({img.value})
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Ou URL externe (https://...)"
                  value={photoForm.customSrc}
                  onChange={(e) =>
                    setPhotoForm({ ...photoForm, customSrc: e.target.value })
                  }
                  className="form-input-admin"
                />
              </div>

              {/* Live Preview */}
              <div style={{ marginBottom: "16px" }}>
                <label className="form-label-admin">Aperçu en direct :</label>
                <div
                  style={{
                    height: "160px",
                    position: "relative",
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid rgba(212,175,55,0.3)",
                  }}
                >
                  <Image
                    src={resolveImageUrl(photoForm.customSrc || photoForm.src, "/wedding.jpg")}
                    alt="Aperçu"
                    fill
                    sizes="400px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </div>

              <div className="form-group-admin">
                <label className="form-label-admin">Description artistique</label>
                <textarea
                  rows={2}
                  placeholder="Lumière naturelle, drapé soyeux, ambiance feutrée..."
                  value={photoForm.description}
                  onChange={(e) =>
                    setPhotoForm({ ...photoForm, description: e.target.value })
                  }
                  className="form-textarea-admin"
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "20px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="btn btn-outline"
                >
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPhoto ? "Enregistrer les modifications" : "Publier la photo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT TEAM MEMBER (WITH FILE UPLOAD) */}
      {/* ========================================================================= */}
      {isTeamModalOpen && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setIsTeamModalOpen(false)}
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingMember ? "Modifier le profil" : "Ajouter un membre d'équipe"}
              </h2>
              <button
                onClick={() => setIsTeamModalOpen(false)}
                className="icon-btn"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTeamMember}>
              <div className="form-group-admin">
                <label className="form-label-admin">Nom complet *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex. Éléonore Puget"
                  value={teamForm.name}
                  onChange={(e) =>
                    setTeamForm({ ...teamForm, name: e.target.value })
                  }
                  className="form-input-admin"
                />
              </div>

              <div className="form-group-admin">
                <label className="form-label-admin">Rôle & Spécialité *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex. Fondatrice & Photographe Principale"
                  value={teamForm.role}
                  onChange={(e) =>
                    setTeamForm({ ...teamForm, role: e.target.value })
                  }
                  className="form-input-admin"
                />
              </div>

              <div className="form-group-admin">
                <label className="form-label-admin">Initiales (2 lettres)</label>
                <input
                  type="text"
                  maxLength={3}
                  placeholder="Ex. EP"
                  value={teamForm.initials}
                  onChange={(e) =>
                    setTeamForm({ ...teamForm, initials: e.target.value.toUpperCase() })
                  }
                  className="form-input-admin"
                />
              </div>

              {/* UPLOAD ZONE FOR TEAM PHOTO */}
              <div className="form-group-admin">
                <label className="form-label-admin">Photo de profil (optionnel)</label>
                
                <div className="upload-box">
                  <input
                    type="file"
                    id="team-upload-input"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleTeamFileUpload}
                  />
                  <label htmlFor="team-upload-input" className="upload-btn-label">
                    <Upload size={16} />
                    <span>
                      {uploadingTeam
                        ? "Téléversement en cours..."
                        : "Téléverser un portrait"}
                    </span>
                  </label>
                </div>

                <input
                  type="text"
                  placeholder="Ou URL externe de l'image (https://...)"
                  value={teamForm.photo}
                  onChange={(e) =>
                    setTeamForm({ ...teamForm, photo: e.target.value })
                  }
                  className="form-input-admin"
                />
              </div>

              {/* Photo Preview if present */}
              {teamForm.photo && (
                <div style={{ marginBottom: "16px" }}>
                  <label className="form-label-admin">Aperçu du portrait :</label>
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      position: "relative",
                      overflow: "hidden",
                      border: "2px solid #d4af37",
                      margin: "0 auto",
                    }}
                  >
                    <Image
                      src={resolveImageUrl(teamForm.photo, "/portrait.jpg")}
                      alt="Portrait"
                      fill
                      sizes="80px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                </div>
              )}

              <div className="form-group-admin">
                <label className="form-label-admin">Biographie & Parcours</label>
                <textarea
                  rows={3}
                  placeholder="Parcours professionnel, vision artistique, années d'expérience..."
                  value={teamForm.bio}
                  onChange={(e) =>
                    setTeamForm({ ...teamForm, bio: e.target.value })
                  }
                  className="form-textarea-admin"
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "20px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsTeamModalOpen(false)}
                  className="btn btn-outline"
                >
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingMember ? "Enregistrer les modifications" : "Ajouter à l'équipe"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
