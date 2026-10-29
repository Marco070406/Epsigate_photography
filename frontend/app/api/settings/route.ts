import { api, jsonError, readJson } from "@/lib/server/http";
import { getSiteSettings, updateSiteSettings } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";

export const GET = api(async () => {
  return Response.json({ success: true, data: await getSiteSettings() });
}, "Impossible de récupérer les paramètres.");

export const POST = api(async (req: Request) => {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const body = await readJson(req);
  if (!body) return jsonError("Requête invalide.", 400);
  return Response.json({ success: true, data: await updateSiteSettings(body) });
}, "Erreur lors de l'enregistrement.");
