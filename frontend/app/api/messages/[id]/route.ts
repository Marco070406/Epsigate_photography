import { api, jsonError, readJson, type IdContext } from "@/lib/server/http";
import { updateMessageStatus, deleteMessage, type MessageStatus } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { invalidate } from "@/lib/server/cache";

const MESSAGE_STATUSES: MessageStatus[] = ["nouveau", "traité", "archivé"];

export const PATCH = api(async (req: Request, { params }: IdContext) => {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { id } = await params;
  const status = (await readJson(req))?.status;
  if (!MESSAGE_STATUSES.includes(status)) return jsonError("Statut invalide.", 400);
  const updated = await updateMessageStatus(id, status);
  if (!updated) return jsonError("Message introuvable.", 404);
  return Response.json({ success: true, data: updated });
}, "Erreur lors de la mise à jour.");

export const DELETE = api(async (req: Request, { params }: IdContext) => {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { id } = await params;
  const deleted = await deleteMessage(id);
  if (!deleted) return jsonError("Message introuvable.", 404);
  invalidate("stats");
  return Response.json({ success: true, message: "Message supprimé." });
}, "Erreur lors de la suppression.");
