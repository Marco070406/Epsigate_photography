import { Router, Request, Response } from "express";
import { getServices, addService, updateService, deleteService } from "../data/db";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.get("/", async (_req: Request, res: Response): Promise<any> => {
  try {
    res.json({ success: true, data: await getServices() });
  } catch {
    res.status(500).json({ error: "Impossible de récupérer les prestations." });
  }
});

router.post("/", requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, badge, image, description, advantages, price } = req.body;
    if (!title || !price) return res.status(400).json({ error: "Titre et tarif requis." });
    const newService = await addService({
      title: String(title).trim(), badge: String(badge || "").trim(),
      image: String(image || "/hero-studio.jpg").trim(),
      description: String(description || "").trim(),
      advantages: Array.isArray(advantages) ? advantages.map((a: any) => String(a).trim()).filter(Boolean) : [],
      price: String(price).trim(),
    });
    return res.status(201).json({ success: true, data: newService });
  } catch {
    return res.status(500).json({ error: "Erreur lors de l'ajout de la prestation." });
  }
});

router.put("/:id", requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, badge, image, description, advantages, price } = req.body;
    const updated = await updateService(req.params.id, {
      ...(title !== undefined && { title: String(title).trim() }),
      ...(badge !== undefined && { badge: String(badge).trim() }),
      ...(image !== undefined && { image: String(image).trim() }),
      ...(description !== undefined && { description: String(description).trim() }),
      ...(advantages !== undefined && { advantages: Array.isArray(advantages) ? advantages.map((a: any) => String(a).trim()).filter(Boolean) : [] }),
      ...(price !== undefined && { price: String(price).trim() }),
    });
    if (!updated) return res.status(404).json({ error: "Prestation introuvable." });
    return res.json({ success: true, data: updated });
  } catch {
    return res.status(500).json({ error: "Erreur lors de la mise à jour." });
  }
});

router.delete("/:id", requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const deleted = await deleteService(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Prestation introuvable." });
    return res.json({ success: true, message: "Prestation supprimée." });
  } catch {
    return res.status(500).json({ error: "Erreur lors de la suppression." });
  }
});

export default router;
