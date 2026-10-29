# Epsigate Photography

Site vitrine et back-office du studio Epsigate Photography (Lomé, Togo).

Une seule application Next.js 16 dans `frontend/` :

- les pages du site et l'administration (`/admin`) ;
- l'API dans `app/api/*` (PostgreSQL, emails via SMTP, images sur Vercel Blob),
  avec son code serveur dans `lib/server/`.

## Installation

```bash
cd frontend
npm install
```

Copier `frontend/.env.example` en `frontend/.env.local` et le compléter
(base PostgreSQL locale, SMTP, `ADMIN_PIN`).

La base peut être vide : au premier appel API, l'application crée les tables et insère
les données de départ (`lib/server/schema.ts`).

## Développement

```bash
cd frontend
npm run dev
```

- Site : http://localhost:3000
- Administration : http://localhost:3000/admin (code `ADMIN_PIN`)
- Santé de l'API et de la base : http://localhost:3000/api/health

## Production (Vercel)

Projet Vercel `epsigate-photography`, dossier racine `frontend`, relié à ce dépôt :
chaque push sur `main` redéploie le site.

Variables d'environnement (Production) : `DATABASE_URL` (Neon), `BLOB_READ_WRITE_TOKEN`
(Vercel Blob), `ADMIN_PIN`, `ADMIN_TOKEN_SECRET` (facultatif), `SMTP_HOST`, `SMTP_PORT`,
`SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`, `EMAIL_ADMIN`.
