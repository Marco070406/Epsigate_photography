import { Router, Request, Response } from "express";
import { getPortfolio, addPortfolioItem, updatePortfolioItem, deletePortfolioItem, Category } from "../data/db";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.get("/", async (_req: Request, res: Response): Promise<any> => {
  try {
    const items = await getPortfolio();
    res.json({ success: true, data: items });
  } catch {
    res.status(500).json({ error: "Impossible de récupérer le portfolio." });
  }
});

router.post("/", requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, category, src, description, featured } = req.body;
    if (!title || !category || !src)
      return res.status(400).json({ error: "Titre, catégorie et image requis." });
    const newItem = await addPortfolioItem({
      title: String(title).trim(), category: category as Category,
      src: String(src).trim(), description: String(description || "").trim(),
      featured: Boolean(featured),
    });
    return res.status(201).json({ success: true, data: newItem });
  } catch {
    return res.status(500).json({ error: "Erreur lors de l'ajout au portfolio." });
  }
});

router.put("/:id", requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, category, src, description, featured } = req.body;
    const updated = await updatePortfolioItem(Number(req.params.id), {
      ...(title !== undefined && { title: String(title).trim() }),
      ...(category !== undefined && { category: category as Category }),
      ...(src !== undefined && { src: String(src).trim() }),
      ...(description !== undefined && { description: String(description).trim() }),
      ...(featured !== undefined && { featured: Boolean(featured) }),
    });
    if (!updated) return res.status(404).json({ error: "Photo introuvable." });
    return res.json({ success: true, data: updated });
  } catch {
    return res.status(500).json({ error: "Erreur lors de la mise à jour." });
  }
});

router.delete("/:id", requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const deleted = await deletePortfolioItem(Number(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Photo introuvable." });
    return res.json({ success: true, message: "Photo supprimée avec succès." });
  } catch {
    return res.status(500).json({ error: "Erreur lors de la suppression." });
  }
});

export default router;
