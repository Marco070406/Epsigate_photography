"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const NAV_LINKS = [
  { href: "/", label: "Accueil", id: "nav-accueil" },
  { href: "/services", label: "Services", id: "nav-services" },
  { href: "/portfolio", label: "Portfolio", id: "nav-portfolio" },
  { href: "/a-propos", label: "À propos", id: "nav-a-propos" },
  { href: "/contact", label: "Contact", id: "nav-contact" },
];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Shadow under the header once the page is scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape closes the mobile menu
  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileNavOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileNavOpen]);

  // Ne pas afficher la navbar publique sur l'espace d'administration
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const closeMobileNav = () => setMobileNavOpen(false);

  const isActive = (href: string) => pathname === href;

  return (
    <header className={`header${scrolled ? " header-scrolled" : ""}`} id="header">
      <div className="container header-inner">
        <Link href="/" className="logo" id="logo">
          Epsigate
        </Link>

        <nav className="nav" id="main-nav" aria-label="Navigation principale">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link${isActive(link.href) ? " nav-link-active" : ""}`}
              aria-current={isActive(link.href) ? "page" : undefined}
              id={link.id}
            >
              {link.label}
            </Link>
          ))}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Basculer le thème"
            id="theme-toggle"
            type="button"
          >
            {theme === "light" ? (
              <Moon size={18} strokeWidth={2} />
            ) : (
              <Sun size={18} strokeWidth={2} />
            )}
          </button>
          <button
            className={`menu-toggle${mobileNavOpen ? " menu-toggle-open" : ""}`}
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label={mobileNavOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-nav"
            id="menu-toggle"
            type="button"
          >
            <span />
            <span />
            <span />
          </button>
        </nav>
      </div>

      {/* Mobile navigation */}
      <nav
        className={`nav-mobile${mobileNavOpen ? " nav-mobile-open" : ""}`}
        id="mobile-nav"
        aria-label="Navigation mobile"
      >
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`nav-link${isActive(link.href) ? " nav-link-active" : ""}`}
            aria-current={isActive(link.href) ? "page" : undefined}
            onClick={closeMobileNav}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
