import { api, jsonError, readJson, type IdContext } from "@/lib/server/http";
import { updateService, deleteService } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { cleanList } from "@/lib/server/validation";

export const PUT = api(async (req: Request, { params }: IdContext) => {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { id } = await params;
  const { title, badge, image, description, advantages, price } = (await readJson(req)) ?? {};
  const updated = await updateService(id, {
    ...(title !== undefined && { title: String(title).trim() }),
    ...(badge !== undefined && { badge: String(badge).trim() }),
    ...(image !== undefined && { image: String(image).trim() }),
    ...(description !== undefined && { description: String(description).trim() }),
    ...(advantages !== undefined && { advantages: cleanList(advantages) }),
    ...(price !== undefined && { price: String(price).trim() }),
  });
  if (!updated) return jsonError("Prestation introuvable.", 404);
  return Response.json({ success: true, data: updated });
}, "Erreur lors de la mise à jour.");

export const DELETE = api(async (req: Request, { params }: IdContext) => {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { id } = await params;
  const deleted = await deleteService(id);
  if (!deleted) return jsonError("Prestation introuvable.", 404);
  return Response.json({ success: true, message: "Prestation supprimée." });
}, "Erreur lors de la suppression.");
