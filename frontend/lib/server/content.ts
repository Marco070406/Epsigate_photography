/**
 * content.ts — Content updates applied to existing databases (see migrate.ts).
 *
 * Each statement is idempotent and only touches rows that still hold the
 * original seed values, so anything edited in the admin is left alone.
 */

/** Bump when CONTENT_SQL changes: migrate.ts re-runs the migration once per version. */
export const CONTENT_VERSION = "content-2026-11-instagram-maps";

/** Real photos from the studio's Instagram and Google Maps listing (files in /public). */
export const PORTFOLIO_ITEMS = [
  { src: "/fashion.jpg", oldTitle: "Collection Soie & Pourpre", category: "Mode", title: "Veste moutarde", description: "Portrait mode en studio, veste jaune moutarde sur fond noir.", featured: true },
  { src: "/portrait.jpg", oldTitle: "Portrait Dirigeante d'Entreprise", category: "Portrait", title: "Portrait fleuri", description: "Maquillage vert vif et couronne de fleurs sur fond émeraude.", featured: true },
  { src: "/event.jpg", oldTitle: "Gala Prestige Lomé 2024", category: "Événementiel", title: "Gala des Entrepreneurs", description: "Prise de parole lors de la grande rencontre annuelle des entrepreneurs à Lomé.", featured: false },
  { src: "/commercial.jpg", oldTitle: "Flacon Aurora — Eau de Parfum", category: "Commercial", title: "Artisanat togolais", description: "Poteries et objets d'art mis en valeur pour une présentation produit.", featured: false },
  { src: "/hero-studio.jpg", oldTitle: "Plateau Technique & Scénographie", category: "Studio", title: "Drapés colorés en studio", description: "Mise en scène sur drapés rouge, jaune et bleu, en lumière douce.", featured: false },
  { src: "/about-photographer.jpg", oldTitle: "Reportage en Coulisses", category: "Studio", title: "Dans les coulisses", description: "L'équipe Epsigate en reportage, appareil en main, au Lac Easter Show.", featured: false },
  { src: "/fashion-2.jpg", oldTitle: "Campagne Hivernal Haute Joaillerie", category: "Mode", title: "Costume orange", description: "Look audacieux sur fond rose, lunettes et veste croisée.", featured: false },
  { src: "/portrait-wax.jpg", category: "Portrait", title: "Sourire en wax", description: "Portrait studio en tenue wax sur fond turquoise.", featured: true },
  { src: "/beaute-noir-blanc.jpg", category: "Portrait", title: "Beauté en noir et blanc", description: "Gros plan, bijoux argentés et contraste profond.", featured: false },
  { src: "/portrait-noir-blanc.jpg", category: "Portrait", title: "Regard en noir et blanc", description: "Portrait intimiste, lumière douce et grain fin.", featured: false },
  { src: "/portrait-costume.jpg", category: "Portrait", title: "Costume bordeaux", description: "Portrait en costume trois pièces sur fond chaud.", featured: false },
  { src: "/portrait-corporate.jpg", category: "Portrait", title: "Portrait corporate", description: "Portrait professionnel pour la communication d'entreprise.", featured: false },
  { src: "/togo-independance.jpg", category: "Événementiel", title: "Fête de l'indépendance", description: "Hommage au Togo, drapeau au vent et tenue rouge et blanche.", featured: false },
  { src: "/concert-chorale.jpg", category: "Événementiel", title: "Concert annuel de la chorale SPJE", description: "Émotion et ferveur sur scène lors du concert annuel.", featured: false },
  { src: "/fimo-haute-couture.jpg", category: "Mode", title: "FIMO 228, Semaine de la haute couture", description: "Tenue d'exception au Festival international de la mode au Togo.", featured: false },
  { src: "/defile-mode.jpg", category: "Mode", title: "Soirée mode & style", description: "Costume brodé sur le podium d'une soirée de mode à Lomé.", featured: false },
] as const;

/** Studio details from its Google Maps listing. */
export const STUDIO_PHONE = "+228 90 78 29 22";
export const STUDIO_ADDRESS = "Djidjolé, à côté de l'école des sourds, Lomé, Togo";
const SEED_PHONE = "+228 90 00 00 00 / +228 22 21 00 00";
const SEED_ADDRESS = "Boulevard du 13 Janvier, Quartier Administratif, Lomé, Togo";

const sql = (value: string | boolean): string =>
  typeof value === "boolean" ? String(value) : `'${value.replace(/'/g, "''")}'`;

function portfolioStatement(item: (typeof PORTFOLIO_ITEMS)[number]): string {
  if ("oldTitle" in item) {
    return `UPDATE portfolio SET title = ${sql(item.title)}, description = ${sql(item.description)}
  WHERE src = ${sql(item.src)} AND title IN (${sql(item.oldTitle)}, ${sql(item.oldTitle.replace("—", "-"))});`;
  }
  return `INSERT INTO portfolio (title, category, src, description, featured)
  SELECT ${sql(item.title)}, ${sql(item.category)}, ${sql(item.src)}, ${sql(item.description)}, ${sql(item.featured)}
  WHERE NOT EXISTS (SELECT 1 FROM portfolio WHERE src = ${sql(item.src)});`;
}

export const CONTENT_SQL = [
  ...PORTFOLIO_ITEMS.map(portfolioStatement),
  `UPDATE settings SET phone = ${sql(STUDIO_PHONE)} WHERE phone = ${sql(SEED_PHONE)};`,
  `UPDATE settings SET address = ${sql(STUDIO_ADDRESS)} WHERE address = ${sql(SEED_ADDRESS)};`,
].join("\n");
