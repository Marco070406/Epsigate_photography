import { Router, Request, Response } from "express";
import { getMessages, updateMessageStatus, deleteMessage, getMessageById, MessageStatus } from "../data/db";
import { requireAuth } from "../middleware/requireAuth";
import { sendReply } from "../lib/mailer";

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

// POST /api/messages/:id/reply — envoie un email de réponse au client
router.post("/:id/reply", requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const { replyText } = req.body;
    if (!replyText || !String(replyText).trim()) {
      return res.status(400).json({ error: "Le texte de la réponse est requis." });
    }

    const msg = await getMessageById(req.params.id);
    if (!msg) return res.status(404).json({ error: "Message introuvable." });

    await sendReply(msg.email, msg.name, String(replyText).trim());

    // Passer automatiquement le message en statut "traité"
    await updateMessageStatus(req.params.id, "traité");

    return res.json({
      success: true,
      message: `Réponse envoyée à ${msg.email}`,
    });
  } catch (err: any) {
    console.error("Reply email error:", err);
    return res.status(500).json({
      error: "Erreur lors de l'envoi de la réponse. Vérifiez la configuration SMTP.",
    });
  }
});

export default router;
