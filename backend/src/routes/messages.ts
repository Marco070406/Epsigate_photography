import { Router, Request, Response } from "express";
import { getMessages, updateMessageStatus, deleteMessage, MessageStatus } from "../data/db";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.get("/", requireAuth, async (_req: Request, res: Response): Promise<any> => {
  try {
    res.json({ success: true, data: await getMessages() });
  } catch {
    res.status(500).json({ error: "Impossible de récupérer les messages." });
  }
});

router.patch("/:id", requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "Statut requis." });
    const updated = await updateMessageStatus(req.params.id, status as MessageStatus);
    if (!updated) return res.status(404).json({ error: "Message introuvable." });
    return res.json({ success: true, data: updated });
  } catch {
    return res.status(500).json({ error: "Erreur lors de la mise à jour." });
  }
});

router.delete("/:id", requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const deleted = await deleteMessage(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Message introuvable." });
    return res.json({ success: true, message: "Message supprimé." });
  } catch {
    return res.status(500).json({ error: "Erreur lors de la suppression." });
  }
});

export default router;
