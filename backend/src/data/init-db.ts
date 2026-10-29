/**
 * init-db.ts — Crée les tables et insère les données de départ (schema.sql)
 * Usage: npm run db:init   (utilise DATABASE_URL ou les variables DB_*)
 * À lancer une seule fois sur une base vide.
 */
import fs from "fs";
import path from "path";
import { pool } from "./database";

async function main() {
  // Lancé depuis backend/ (compilé dans dist/, schema.sql reste dans src/)
  const sql = fs.readFileSync(path.resolve(process.cwd(), "src/data/schema.sql"), "utf-8");
  const existing = await pool.query("SELECT to_regclass('public.settings') AS t");
  if (existing.rows[0]?.t) {
    console.log("ℹ️  La base contient déjà les tables : création ignorée pour éviter les doublons.");
    await pool.query(sql.split(/-- =+\r?\n-- SEED DATA/)[0]);
    console.log("✅ Tables manquantes créées le cas échéant.");
    return;
  }
  await pool.query(sql);
  console.log("✅ Base initialisée avec schema.sql");
}

main()
  .catch((err) => {
    console.error("❌ Échec de l'initialisation :", err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
