import { Router, Request, Response } from "express";
import { getSiteStats } from "../data/db";

const router = Router();

router.get("/", async (_req: Request, res: Response): Promise<any> => {
  try {
    res.json({ success: true, data: await getSiteStats() });
  } catch {
    res.status(500).json({ error: "Impossible de récupérer les statistiques." });
  }
});

export default router;
