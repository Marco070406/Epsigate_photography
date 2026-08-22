-- ============================================================
-- EPSIGATE PHOTOGRAPHY — Schema PostgreSQL
-- ============================================================

-- Portfolio
CREATE TABLE IF NOT EXISTS portfolio (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  category    VARCHAR(50)  NOT NULL CHECK (category IN ('Mariage','Mode','Portrait','Événementiel','Commercial','Studio')),
  src         TEXT         NOT NULL,
  description TEXT         DEFAULT '',
  featured    BOOLEAN      DEFAULT FALSE,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- Services
CREATE TABLE IF NOT EXISTS services (
  id          VARCHAR(100) PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  badge       VARCHAR(100) DEFAULT '',
  image       TEXT         DEFAULT '/hero-studio.jpg',
  description TEXT         DEFAULT '',
  advantages  TEXT[]       DEFAULT '{}',
  price       VARCHAR(100) NOT NULL,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- Team
CREATE TABLE IF NOT EXISTS team (
  id          VARCHAR(100) PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  role        VARCHAR(255) NOT NULL,
  initials    VARCHAR(10)  DEFAULT '',
  bio         TEXT         DEFAULT '',
  photo       TEXT,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id          VARCHAR(100) PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  phone       VARCHAR(50)  NOT NULL,
  purpose     VARCHAR(50)  DEFAULT 'devis',
  service     VARCHAR(50)  DEFAULT 'autre',
  date        DATE,
  message     TEXT         NOT NULL,
  status      VARCHAR(20)  DEFAULT 'nouveau' CHECK (status IN ('nouveau','traité','archivé')),
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- Settings (single row)
CREATE TABLE IF NOT EXISTS settings (
  id               SERIAL PRIMARY KEY,
  studio_name      VARCHAR(255) DEFAULT 'Epsigate Photography',
  tagline          TEXT         DEFAULT '',
  address          TEXT         DEFAULT '',
  zone             TEXT         DEFAULT '',
  phone            VARCHAR(100) DEFAULT '',
  whatsapp         VARCHAR(50)  DEFAULT '',
  email            VARCHAR(255) DEFAULT '',
  weekday_hours    VARCHAR(100) DEFAULT '',
  saturday_hours   VARCHAR(100) DEFAULT '',
  response_delay   VARCHAR(100) DEFAULT '',
  hero_headline    TEXT         DEFAULT '',
  hero_subtitle    TEXT         DEFAULT '',
  about_story      TEXT         DEFAULT '',
  map_embed_url    TEXT         DEFAULT '',
  google_maps_link TEXT         DEFAULT ''
);

-- Stats (single row)
CREATE TABLE IF NOT EXISTS stats (
  id                      SERIAL PRIMARY KEY,
  monthly_visits          INTEGER DEFAULT 0,
  response_rate_percent   INTEGER DEFAULT 98,
  active_projects         INTEGER DEFAULT 0,
  traffic_history         JSONB   DEFAULT '[]',
  category_breakdown      JSONB   DEFAULT '[]'
);

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO portfolio (title, category, src, description, featured) VALUES
  ('Mariage au Domaine des Étoiles',      'Mariage',       '/wedding.jpg',           'Élégance gothique et lumières tamisées pour une union royale.',                true),
  ('Collection Soie & Pourpre',            'Mode',          '/fashion.jpg',           'Shooting éditorial haute couture, drapé architectural et clair-obscur.',      true),
  ('Portrait Dirigeante d''Entreprise',    'Portrait',      '/portrait.jpg',          'Éclairage doux et posture charismatique en boiseries d''époque.',              true),
  ('Gala Prestige Lomé 2024',              'Événementiel',  '/event.jpg',             'Atmosphère festive et lustres en cristal pour une soirée d''exception.',       false),
  ('Flacon Aurora — Eau de Parfum',        'Commercial',    '/commercial.jpg',        'Packshot publicitaire de luxe sur socle de marbre et rétroéclairage rubis.',   false),
  ('Plateau Technique & Scénographie',     'Studio',        '/hero-studio.jpg',       'Mise en scène studio avec éclairages bordeaux et caméras cinéma.',             false),
  ('Laboratoire de Retouche Numérique',    'Studio',        '/about-photographer.jpg','Étalonnage colorimétrique haute fidélité en direct sur moniteur calibré.',     false),
  ('Valse Nocturne & Féerie',              'Mariage',       '/wedding.jpg',           'Moments d''émotions partagés dans un cadre architectural majestueux.',         false),
  ('Campagne Hivernal Haute Joaillerie',   'Mode',          '/fashion.jpg',           'Mise en lumière des reflets et des matières nobles.',                          false)
ON CONFLICT DO NOTHING;

INSERT INTO services (id, title, badge, image, description, advantages, price) VALUES
  ('shooting-studio', 'Shooting Photo (Studio & Extérieur)', 'Prestation Studio & Plein Air', '/hero-studio.jpg',
   'Une séance sur-mesure conçue pour révéler votre univers.',
   ARRAY['Accompagnement stylistique et pose guidée','Plateau technique professionnel climatisé','Galerie privée sécurisée sous 72h','Tirages d''art haute définition inclus'],
   'À partir de 75 000 FCFA'),
  ('mariage', 'Photographie de Mariage', 'Célébration d''Exception', '/wedding.jpg',
   'Une couverture complète et discrète de votre journée inoubliable.',
   ARRAY['Séance d''engagement préalable offerte','Reportage complet (Cérémonie civile, religieuse, réception)','Coffret de luxe avec clé USB et tirages','Livre photo artisanal prestige'],
   'À partir de 450 000 FCFA'),
  ('mode', 'Photographie de Mode & Lookbook', 'Haute Couture & Éditorial', '/fashion.jpg',
   'Sublimez vos collections de pagnes, haute couture, prêt-à-porter et joaillerie.',
   ARRAY['Direction artistique et moodboard personnalisés','Formats adaptés pour e-commerce et campagnes print','Gestion de la colorimétrie textile exacte','Cession de droits d''exploitation claire'],
   'Sur devis personnalisé'),
  ('portrait', 'Portrait Professionnel & Corporate', 'Image de Marque & Personal Branding', '/portrait.jpg',
   'Donnez une dimension statutaire et humaine à votre communication d''entreprise.',
   ARRAY['Mise en confiance rapide et naturelle','Optimisation pour LinkedIn, presse et rapports annuels','Shooting au studio ou directement dans vos locaux','Retouche subtile respectant le naturel'],
   'À partir de 45 000 FCFA / pers.'),
  ('evenementiel', 'Couverture Événementielle', 'Galas & Soirées Prestigieuses', '/event.jpg',
   'Immortalisez l''ambiance de vos conférences, sommets internationaux, galas.',
   ARRAY['Livraison express pour vos relations presse / réseaux sociaux','Discrétion absolue et élégance en toutes circonstances','Option studio photocall / photocabine haut de gamme','Couverture multi-photographes possible'],
   'À partir de 250 000 FCFA / demi-journée'),
  ('commercial', 'Photographie Produit & Commerciale', 'Packshot & Publicité', '/commercial.jpg',
   'Des visuels percutants pour vos packshots de prestige.',
   ARRAY['Éclairage macro haute précision','Détourage transparent et décors d''ambiance 3D/réels','Résolution ultra-haute pour affichage grand format','Déclinaisons réseaux sociaux & marketplace'],
   'Sur devis selon volume'),
  ('retouche', 'Retouche & Traitement d''Images', 'Post-Production d''Excellence', '/about-photographer.jpg',
   'Un service dédié de retouche éditoriale, étalonnage couleur cinéma.',
   ARRAY['Retouche de peau High-End par séparation de fréquence','Harmonisation de palettes et Color Grading sur mesure','Nettoyage de fonds et suppression d''imperfections','Export sécurisé calibré pour l''impression fine art'],
   'À partir de 15 000 FCFA / image')
ON CONFLICT DO NOTHING;

INSERT INTO team (id, name, role, initials, bio) VALUES
  ('member-1', 'Éléonore Puget',   'Fondatrice & Photographe Principale', 'EP', 'Formée aux techniques de pointe de la photographie internationale, 15 ans d''expérience en mode, éditorial et reportage de mariage d''exception.'),
  ('member-2', 'Alexandre Laurent', 'Directeur Artistique & Studio',       'AL', 'Spécialiste de la scénographie lumineuse, il façonne des ambiances cinématographiques uniques pour chaque séance au studio de Lomé.'),
  ('member-3', 'Marc Dupont',       'Expert Post-Production & Coloriste',  'MD', 'Maître du compositing et du grain argentique, il peaufine chaque cliché pour une finition digne des plus grands magazines.')
ON CONFLICT DO NOTHING;

INSERT INTO settings (
  studio_name, tagline, address, zone, phone, whatsapp, email,
  weekday_hours, saturday_hours, response_delay,
  hero_headline, hero_subtitle, about_story,
  map_embed_url, google_maps_link
) VALUES (
  'Epsigate Photography',
  'Studio de Photographie Professionnelle — Lomé & International',
  'Boulevard du 13 Janvier, Quartier Administratif, Lomé, Togo',
  'Lomé, tout le Togo, Afrique de l''Ouest & International',
  '+228 90 00 00 00 / +228 22 21 00 00',
  '+228 90 00 00 00',
  'contact@epsigate-photography.com',
  'Lundi – Vendredi : 08:30 – 18:30',
  'Samedi : 09:00 – 18:00 (Shooting sur réservation)',
  'Engagement de réponse sous 24h ouvrées',
  'L''Art de Sublimer Chaque Instant',
  'De la haute couture aux unions d''exception, nous capturons l''émotion pure et l''élégance intemporelle.',
  'Fondé par des passionnés de l''image et de l''éclairage dramatique, Epsigate Photography allie rigueur technique et sensibilité artistique.',
  'https://maps.google.com/maps?q=6.1844304,1.1966077&z=17&ie=UTF8&iwloc=&output=embed',
  'https://maps.app.goo.gl/3oND2H3hZHEffikQ8'
);

INSERT INTO stats (monthly_visits, response_rate_percent, active_projects, traffic_history, category_breakdown)
VALUES (
  3840, 98, 7,
  '[{"month":"Jan","visits":2100,"inquiries":24},{"month":"Fév","visits":2650,"inquiries":31},{"month":"Mar","visits":3100,"inquiries":38},{"month":"Avr","visits":3400,"inquiries":42},{"month":"Mai","visits":3840,"inquiries":48}]',
  '[{"category":"Mariage","count":42},{"category":"Mode","count":28},{"category":"Portrait","count":20},{"category":"Événementiel","count":18},{"category":"Commercial","count":12},{"category":"Studio","count":15}]'
);
