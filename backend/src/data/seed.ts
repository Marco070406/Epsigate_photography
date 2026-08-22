/**
 * seed.ts — Insère les données initiales via le pool Node.js (UTF-8 natif)
 * Usage: npx ts-node src/data/seed.ts
 */
import dotenv from "dotenv";
dotenv.config();

import { pool } from "./database";

async function seed() {
  const client = await pool.connect();
  try {
    console.log("🌱 Seeding database...");

    await client.query("BEGIN");

    // Portfolio
    await client.query(`
      INSERT INTO portfolio (title, category, src, description, featured) VALUES
      ('Mariage au Domaine des Étoiles',      'Mariage',       '/wedding.jpg',            'Élégance gothique et lumières tamisées pour une union royale.',                 true),
      ('Collection Soie & Pourpre',            'Mode',          '/fashion.jpg',            'Shooting éditorial haute couture, drapé architectural et clair-obscur.',       true),
      ('Portrait Dirigeante d''Entreprise',    'Portrait',      '/portrait.jpg',           'Éclairage doux et posture charismatique en boiseries d''époque.',               true),
      ('Gala Prestige Lomé 2024',              'Événementiel',  '/event.jpg',              'Atmosphère festive et lustres en cristal pour une soirée d''exception.',        false),
      ('Flacon Aurora — Eau de Parfum',        'Commercial',    '/commercial.jpg',         'Packshot publicitaire de luxe sur socle de marbre et rétroéclairage rubis.',    false),
      ('Plateau Technique & Scénographie',     'Studio',        '/hero-studio.jpg',        'Mise en scène studio avec éclairages bordeaux et caméras cinéma.',              false),
      ('Laboratoire de Retouche Numérique',    'Studio',        '/about-photographer.jpg', 'Étalonnage colorimétrique haute fidélité en direct sur moniteur calibré.',      false),
      ('Valse Nocturne & Féerie',              'Mariage',       '/wedding.jpg',            'Moments d''émotions partagés dans un cadre architectural majestueux.',          false),
      ('Campagne Hivernal Haute Joaillerie',   'Mode',          '/fashion.jpg',            'Mise en lumière des reflets et des matières nobles.',                           false)
      ON CONFLICT DO NOTHING
    `);
    console.log("✅ Portfolio seeded");

    // Services
    const services = [
      {
        id: "shooting-studio",
        title: "Shooting Photo (Studio & Extérieur)",
        badge: "Prestation Studio & Plein Air",
        image: "/hero-studio.jpg",
        description: "Une séance sur-mesure conçue pour révéler votre univers. En studio climatisé équipé de modeleurs de lumière professionnels ou en décors extérieurs à Lomé et dans tout le Togo.",
        advantages: ["Accompagnement stylistique et pose guidée", "Plateau technique professionnel climatisé", "Galerie privée sécurisée sous 72h", "Tirages d'art haute définition inclus"],
        price: "À partir de 75 000 FCFA",
      },
      {
        id: "mariage",
        title: "Photographie de Mariage",
        badge: "Célébration d'Exception",
        image: "/wedding.jpg",
        description: "Une couverture complète et discrète de votre journée inoubliable. Des préparatifs matinaux à la soirée de gala, chaque émotion est immortalisée avec poésie et raffinement.",
        advantages: ["Séance d'engagement préalable offerte", "Reportage complet (Cérémonie civile, religieuse, réception)", "Coffret de luxe avec clé USB et tirages", "Livre photo artisanal prestige"],
        price: "À partir de 450 000 FCFA",
      },
      {
        id: "mode",
        title: "Photographie de Mode & Lookbook",
        badge: "Haute Couture & Éditorial",
        image: "/fashion.jpg",
        description: "Sublimez vos collections de pagnes, haute couture, prêt-à-porter et joaillerie. Nous collaborons avec vos stylistes et mannequins pour créer une identité visuelle saisissante.",
        advantages: ["Direction artistique et moodboard personnalisés", "Formats adaptés pour e-commerce et campagnes print", "Gestion de la colorimétrie textile exacte", "Cession de droits d'exploitation claire"],
        price: "Sur devis personnalisé",
      },
      {
        id: "portrait",
        title: "Portrait Professionnel & Corporate",
        badge: "Image de Marque & Personal Branding",
        image: "/portrait.jpg",
        description: "Donnez une dimension statutaire et humaine à votre communication d'entreprise, profils exécutifs, comités de direction ou trombinoscopes d'équipes à Lomé.",
        advantages: ["Mise en confiance rapide et naturelle", "Optimisation pour LinkedIn, presse et rapports annuels", "Shooting au studio ou directement dans vos locaux", "Retouche subtile respectant le naturel"],
        price: "À partir de 45 000 FCFA / pers.",
      },
      {
        id: "evenementiel",
        title: "Couverture Événementielle",
        badge: "Galas & Soirées Prestigieuses",
        image: "/event.jpg",
        description: "Immortalisez l'ambiance de vos conférences, sommets internationaux, galas, remises de prix, lancements de produits ou soirées privées au Togo.",
        advantages: ["Livraison express pour vos relations presse / réseaux sociaux", "Discrétion absolue et élégance en toutes circonstances", "Option studio photocall / photocabine haut de gamme", "Couverture multi-photographes possible"],
        price: "À partir de 250 000 FCFA / demi-journée",
      },
      {
        id: "commercial",
        title: "Photographie Produit & Commerciale",
        badge: "Packshot & Publicité",
        image: "/commercial.jpg",
        description: "Des visuels percutants pour vos packshots de prestige (cosmétiques, mode, agroalimentaire de luxe, hôtellerie) mettant en valeur matières et textures.",
        advantages: ["Éclairage macro haute précision", "Détourage transparent et décors d'ambiance 3D/réels", "Résolution ultra-haute pour affichage grand format", "Déclinaisons réseaux sociaux & marketplace"],
        price: "Sur devis selon volume",
      },
      {
        id: "retouche",
        title: "Retouche & Traitement d'Images",
        badge: "Post-Production d'Excellence",
        image: "/about-photographer.jpg",
        description: "Un service dédié de retouche éditoriale, étalonnage couleur cinéma, compositing avancé et restauration de clichés précieux.",
        advantages: ["Retouche de peau High-End par séparation de fréquence", "Harmonisation de palettes et Color Grading sur mesure", "Nettoyage de fonds et suppression d'imperfections", "Export sécurisé calibré pour l'impression fine art"],
        price: "À partir de 15 000 FCFA / image",
      },
    ];

    for (const s of services) {
      await client.query(
        `INSERT INTO services (id, title, badge, image, description, advantages, price)
         VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING`,
        [s.id, s.title, s.badge, s.image, s.description, s.advantages, s.price]
      );
    }
    console.log("✅ Services seeded");

    // Team
    await client.query(`
      INSERT INTO team (id, name, role, initials, bio) VALUES
      ('member-1', 'Éléonore Puget',    'Fondatrice & Photographe Principale', 'EP', 'Formée aux techniques de pointe de la photographie internationale, 15 ans d''expérience en mode, éditorial et reportage de mariage d''exception.'),
      ('member-2', 'Alexandre Laurent', 'Directeur Artistique & Studio',        'AL', 'Spécialiste de la scénographie lumineuse, il façonne des ambiances cinématographiques uniques pour chaque séance au studio de Lomé.'),
      ('member-3', 'Marc Dupont',       'Expert Post-Production & Coloriste',   'MD', 'Maître du compositing et du grain argentique, il peaufine chaque cliché pour une finition digne des plus grands magazines.')
      ON CONFLICT DO NOTHING
    `);
    console.log("✅ Team seeded");

    // Settings
    await client.query(`
      INSERT INTO settings (
        studio_name, tagline, address, zone, phone, whatsapp, email,
        weekday_hours, saturday_hours, response_delay,
        hero_headline, hero_subtitle, about_story,
        map_embed_url, google_maps_link
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
    `, [
      "Epsigate Photography",
      "Studio de Photographie Professionnelle — Lomé & International",
      "Boulevard du 13 Janvier, Quartier Administratif, Lomé, Togo",
      "Lomé, tout le Togo, Afrique de l'Ouest & International",
      "+228 90 00 00 00 / +228 22 21 00 00",
      "+228 90 00 00 00",
      "contact@epsigate-photography.com",
      "Lundi – Vendredi : 08:30 – 18:30",
      "Samedi : 09:00 – 18:00 (Shooting sur réservation)",
      "Engagement de réponse sous 24h ouvrées",
      "L'Art de Sublimer Chaque Instant",
      "De la haute couture aux unions d'exception, nous capturons l'émotion pure et l'élégance intemporelle avec une signature visuelle cinématographique.",
      "Fondé par des passionnés de l'image et de l'éclairage dramatique, Epsigate Photography allie rigueur technique et sensibilité artistique.",
      "https://maps.google.com/maps?q=6.1844304,1.1966077&z=17&ie=UTF8&iwloc=&output=embed",
      "https://maps.app.goo.gl/3oND2H3hZHEffikQ8",
    ]);
    console.log("✅ Settings seeded");

    // Stats
    await client.query(`
      INSERT INTO stats (monthly_visits, response_rate_percent, active_projects, traffic_history, category_breakdown)
      VALUES ($1,$2,$3,$4,$5)
    `, [
      3840, 98, 7,
      JSON.stringify([
        { month: "Jan", visits: 2100, inquiries: 24 },
        { month: "Fév", visits: 2650, inquiries: 31 },
        { month: "Mar", visits: 3100, inquiries: 38 },
        { month: "Avr", visits: 3400, inquiries: 42 },
        { month: "Mai", visits: 3840, inquiries: 48 },
      ]),
      JSON.stringify([
        { category: "Mariage", count: 42 },
        { category: "Mode", count: 28 },
        { category: "Portrait", count: 20 },
        { category: "Événementiel", count: 18 },
        { category: "Commercial", count: 12 },
        { category: "Studio", count: 15 },
      ]),
    ]);
    console.log("✅ Stats seeded");

    await client.query("COMMIT");
    console.log("🎉 Database seeded successfully!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seed failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
