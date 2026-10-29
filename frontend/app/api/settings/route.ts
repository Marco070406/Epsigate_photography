import { api, publicJson, jsonError, readJson } from "@/lib/server/http";
import { updateSiteSettings } from "@/lib/server/db";
import { cachedSettings, invalidate } from "@/lib/server/cache";
import { requireAdmin } from "@/lib/server/auth";

export const GET = api(async (req: Request) => {
  return publicJson(req, await cachedSettings());
}, "Impossible de récupérer les paramètres.");

export const POST = api(async (req: Request) => {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const body = await readJson(req);
  if (!body) return jsonError("Requête invalide.", 400);
  // Used as iframe src / link href on the site: only https URLs (never javascript:)
  for (const field of ["mapEmbedUrl", "googleMapsLink"]) {
    const value = body[field];
    if (value && !/^https:\/\/[^\s]+$/i.test(String(value).trim())) {
      return jsonError("Les liens de carte doivent commencer par https://", 400);
    }
  }
  const updated = await updateSiteSettings(body);
  invalidate("settings");
  return Response.json({ success: true, data: updated });
}, "Erreur lors de l'enregistrement.");
