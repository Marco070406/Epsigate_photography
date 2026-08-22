import { Router, Request, Response } from "express";
import { getSiteSettings, updateSiteSettings } from "../data/db";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.get("/", async (_req: Request, res: Response): Promise<any> => {
  try {
    res.json({ success: true, data: await getSiteSettings() });
  } catch {
    res.status(500).json({ error: "Impossible de récupérer les paramètres." });
  }
});

router.post("/", requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const updated = await updateSiteSettings(req.body);
    res.json({ success: true, data: updated });
  } catch {
    res.status(500).json({ error: "Erreur lors de l'enregistrement." });
  }
});

export default router;
