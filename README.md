# Epsigate Photography

Site vitrine et back-office du studio Epsigate Photography (Lomé, Togo).

- `frontend/` — Next.js 16 (App Router), déployé sur Vercel
- `backend/` — API REST Express + PostgreSQL, emails via SMTP (Nodemailer)

## Installation

```bash
npm install
npm run install:all
```

Créer la base PostgreSQL puis appliquer le schéma (avec données de départ) :

```bash
psql -U postgres -d epsigate_db -f backend/src/data/schema.sql
```

Copier les fichiers d'environnement et les compléter :

- `backend/.env.example` → `backend/.env`
- `frontend/.env.example` → `frontend/.env.local`

## Développement

```bash
npm run dev
```

- Site : http://localhost:3000
- Administration : http://localhost:3000/admin (code `ADMIN_PIN`)
- API : http://localhost:5000/api — santé : http://localhost:5000/health

## Production

```bash
npm run build
npm start
```

En production, définir au minimum `ADMIN_PIN`, `ADMIN_TOKEN_SECRET`, `CORS_ORIGIN`
(URL du site, plusieurs valeurs séparées par des virgules), les variables `DB_*` et `SMTP_*`
côté backend, et `NEXT_PUBLIC_API_URL` côté frontend.
