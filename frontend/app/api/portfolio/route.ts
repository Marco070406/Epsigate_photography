import { api, publicJson, jsonError, readJson } from "@/lib/server/http";
import { addPortfolioItem } from "@/lib/server/db";
import { cachedPortfolio, invalidate } from "@/lib/server/cache";
import { requireAdmin } from "@/lib/server/auth";
import { PORTFOLIO_CATEGORIES } from "@/lib/server/validation";

export const GET = api(async (req: Request) => {
  return publicJson(req, await cachedPortfolio());
}, "Impossible de récupérer le portfolio.");

export const POST = api(async (req: Request) => {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { title, category, src, description, featured } = (await readJson(req)) ?? {};
  if (!title || !category || !src) return jsonError("Titre, catégorie et image requis.", 400);
  if (!PORTFOLIO_CATEGORIES.includes(category)) return jsonError("Catégorie invalide.", 400);
  const newItem = await addPortfolioItem({
    title: String(title).trim(), category,
    src: String(src).trim(), description: String(description || "").trim(),
    featured: Boolean(featured),
  });
  invalidate("portfolio");
  return Response.json({ success: true, data: newItem }, { status: 201 });
}, "Erreur lors de l'ajout au portfolio.");
