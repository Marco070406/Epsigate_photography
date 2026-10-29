import { api } from "@/lib/server/http";
import { query } from "@/lib/server/database";

// Also checks the database connection (api() runs the schema migration first)
export const GET = api(async () => {
  await query("SELECT 1");
  return Response.json({ status: "ok", service: "Epsigate Photography API", timestamp: new Date().toISOString() });
}, "Base de données inaccessible.");
