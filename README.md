# Epsigate Photography

Site vitrine et back-office du studio Epsigate Photography (Lomé, Togo).

- `frontend/` — Next.js 16 (App Router), déployé sur Vercel
- `backend/` — API REST Express + PostgreSQL, emails via SMTP (Nodemailer)

## Installation

```bash
npm install
npm run install:all
```

Créer une base PostgreSQL vide : au premier appel API, le backend crée les tables
et insère les données de départ (`backend/src/data/schema.ts`). Pour le faire à la main :

```bash
cd backend && npm run db:init
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

## Production (Vercel)

Deux projets Vercel reliés à ce dépôt :

- `epsigate-photography` — dossier racine `frontend`, variable `NEXT_PUBLIC_API_URL`
  (`https://epsigate-api.vercel.app/api`)
- `epsigate-api` — dossier racine `backend` (Express en fonction Vercel), variables :
  `DATABASE_URL` (Neon), `BLOB_READ_WRITE_TOKEN` (Vercel Blob, images), `ADMIN_PIN`,
  `ADMIN_TOKEN_SECRET` (facultatif), `CORS_ORIGIN` (URL du site), `SMTP_*`, `EMAIL_*`

Chaque push sur `main` redéploie les deux projets.
