"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();

  // Ne pas afficher la navbar publique sur l'espace d'administration
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const closeMobileNav = () => setMobileNavOpen(false);

  const isActive = (href: string) => pathname === href;

  return (
    <header className="header" id="header">
      <div className="container header-inner">
        <Link href="/" className="logo" id="logo">
          Epsigate
        </Link>

        <nav className="nav" id="main-nav">
          <Link
            href="/"
            className={`nav-link${isActive("/") ? " nav-link-active" : ""}`}
            id="nav-accueil"
          >
            Accueil
          </Link>
          <Link
            href="/services"
            className={`nav-link${isActive("/services") ? " nav-link-active" : ""}`}
            id="nav-services"
          >
            Services
          </Link>
          <Link
            href="/portfolio"
            className={`nav-link${isActive("/portfolio") ? " nav-link-active" : ""}`}
            id="nav-portfolio"
          >
            Portfolio
          </Link>
          <Link
            href="/a-propos"
            className={`nav-link${isActive("/a-propos") ? " nav-link-active" : ""}`}
            id="nav-a-propos"
          >
            À propos
          </Link>
          <Link
            href="/contact"
            className={`nav-link${isActive("/contact") ? " nav-link-active" : ""}`}
            id="nav-contact"
          >
            Contact
          </Link>
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
            className="menu-toggle"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Menu"
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
      >
        <Link href="/" className="nav-link" onClick={closeMobileNav}>
          Accueil
        </Link>
        <Link href="/services" className="nav-link" onClick={closeMobileNav}>
          Services
        </Link>
        <Link href="/portfolio" className="nav-link" onClick={closeMobileNav}>
          Portfolio
        </Link>
        <Link href="/a-propos" className="nav-link" onClick={closeMobileNav}>
          À propos
        </Link>
        <Link href="/contact" className="nav-link" onClick={closeMobileNav}>
          Contact
        </Link>
      </nav>
    </header>
  );
}
