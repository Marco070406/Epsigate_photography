/**
 * init-db.ts — Crée les tables et insère les données de départ si la base est vide.
 * Usage: npm run db:init   (utilise DATABASE_URL ou les variables DB_*)
 * Facultatif : le serveur fait la même chose au premier appel API.
 */
import { pool } from "./database";
import { ensureSchema } from "./migrate";

ensureSchema()
  .then(() => console.log("✅ Base prête"))
  .catch((err) => {
    console.error("❌ Échec de l'initialisation :", err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
