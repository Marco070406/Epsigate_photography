import { api, jsonError, readJson, type IdContext } from "@/lib/server/http";
import { updatePortfolioItem, deletePortfolioItem } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { invalidate } from "@/lib/server/cache";
import { PORTFOLIO_CATEGORIES, parseId } from "@/lib/server/validation";

export const PUT = api(async (req: Request, { params }: IdContext) => {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const id = parseId((await params).id);
  if (id === null) return jsonError("Photo introuvable.", 404);
  const { title, category, src, description, featured } = (await readJson(req)) ?? {};
  if (category !== undefined && !PORTFOLIO_CATEGORIES.includes(category))
    return jsonError("Catégorie invalide.", 400);
  const updated = await updatePortfolioItem(id, {
    ...(title !== undefined && { title: String(title).trim() }),
    ...(category !== undefined && { category }),
    ...(src !== undefined && { src: String(src).trim() }),
    ...(description !== undefined && { description: String(description).trim() }),
    ...(featured !== undefined && { featured: Boolean(featured) }),
  });
  if (!updated) return jsonError("Photo introuvable.", 404);
  invalidate("portfolio");
  return Response.json({ success: true, data: updated });
}, "Erreur lors de la mise à jour.");

export const DELETE = api(async (req: Request, { params }: IdContext) => {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const id = parseId((await params).id);
  if (id === null) return jsonError("Photo introuvable.", 404);
  const deleted = await deletePortfolioItem(id);
  if (!deleted) return jsonError("Photo introuvable.", 404);
  invalidate("portfolio");
  return Response.json({ success: true, message: "Photo supprimée avec succès." });
}, "Erreur lors de la suppression.");
