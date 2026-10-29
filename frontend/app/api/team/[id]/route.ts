import { api, jsonError, readJson, type IdContext } from "@/lib/server/http";
import { updateTeamMember, deleteTeamMember } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";

export const PUT = api(async (req: Request, { params }: IdContext) => {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { id } = await params;
  const { name, role, initials, bio, photo } = (await readJson(req)) ?? {};
  const updated = await updateTeamMember(id, {
    ...(name !== undefined && { name: String(name).trim() }),
    ...(role !== undefined && { role: String(role).trim() }),
    ...(initials !== undefined && { initials: String(initials).trim().slice(0, 10) }),
    ...(bio !== undefined && { bio: String(bio).trim() }),
    ...(photo !== undefined && { photo: String(photo).trim() }),
  });
  if (!updated) return jsonError("Membre introuvable.", 404);
  return Response.json({ success: true, data: updated });
}, "Erreur lors de la mise à jour.");

export const DELETE = api(async (req: Request, { params }: IdContext) => {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { id } = await params;
  const deleted = await deleteTeamMember(id);
  if (!deleted) return jsonError("Membre introuvable.", 404);
  return Response.json({ success: true, message: "Membre retiré de l'équipe." });
}, "Erreur lors de la suppression.");
