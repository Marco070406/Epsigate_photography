import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import ThemeProvider from "./components/ThemeProvider";
import Header from "./components/Header";
import Footer from "./components/Footer";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Epsigate Photography - Studio de photographie professionnelle",
    template: "%s | Epsigate Photography",
  },
  description:
    "Epsigate Photography est un studio haut de gamme spécialisé en photographie de mariage, mode, portrait, événementiel et commercial. Excellence visuelle et créativité à votre service.",
  keywords: [
    "photographie",
    "studio photo",
    "photographe professionnel",
    "mariage",
    "mode",
    "portrait",
    "Epsigate",
  ],
  openGraph: {
    title: "Epsigate Photography",
    description:
      "Studio de photographie professionnelle - Excellence visuelle & créativité",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${cormorant.variable} ${jost.variable} antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>
          <Header />
          <main className="main-content">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
