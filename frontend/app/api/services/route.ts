import { api, jsonError, readJson } from "@/lib/server/http";
import { getServices, addService } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { cleanList } from "@/lib/server/validation";

export const GET = api(async () => {
  return Response.json({ success: true, data: await getServices() });
}, "Impossible de récupérer les prestations.");

export const POST = api(async (req: Request) => {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { title, badge, image, description, advantages, price } = (await readJson(req)) ?? {};
  if (!title || !price) return jsonError("Titre et tarif requis.", 400);
  const newService = await addService({
    title: String(title).trim(), badge: String(badge || "").trim(),
    image: String(image || "/hero-studio.jpg").trim(),
    description: String(description || "").trim(),
    advantages: cleanList(advantages),
    price: String(price).trim(),
  });
  return Response.json({ success: true, data: newService }, { status: 201 });
}, "Erreur lors de l'ajout de la prestation.");
