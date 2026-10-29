import { api, jsonError, readJson, type IdContext } from "@/lib/server/http";
import { getMessageById, updateMessageStatus } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { sendReply } from "@/lib/server/mailer";

// POST /api/messages/:id/reply — envoie un email de réponse au client
export const POST = api(async (req: Request, { params }: IdContext) => {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { id } = await params;

  const replyText = (await readJson(req))?.replyText;
  if (!replyText || !String(replyText).trim()) {
    return jsonError("Le texte de la réponse est requis.", 400);
  }

  const msg = await getMessageById(id);
  if (!msg) return jsonError("Message introuvable.", 404);

  await sendReply(msg.email, msg.name, String(replyText).trim());

  // Passer automatiquement le message en statut "traité"
  await updateMessageStatus(id, "traité");

  return Response.json({ success: true, message: `Réponse envoyée à ${msg.email}` });
}, "Erreur lors de l'envoi de la réponse. Vérifiez la configuration SMTP.");
