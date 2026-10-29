import { api, publicJson, jsonError, readJson } from "@/lib/server/http";
import { addTeamMember } from "@/lib/server/db";
import { cachedTeam, invalidate } from "@/lib/server/cache";
import { requireAdmin } from "@/lib/server/auth";

export const GET = api(async (req: Request) => {
  return publicJson(req, await cachedTeam());
}, "Impossible de récupérer l'équipe.");

export const POST = api(async (req: Request) => {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { name, role, initials, bio, photo } = (await readJson(req)) ?? {};
  if (!name || !role) return jsonError("Nom et rôle requis.", 400);
  const calculatedInitials = (
    initials
      ? String(initials).trim()
      : String(name).trim().split(/\s+/).map((n: string) => n[0]).join("").toUpperCase()
  ).slice(0, 10); // initials column is VARCHAR(10)
  const newMember = await addTeamMember({
    name: String(name).trim(), role: String(role).trim(),
    initials: calculatedInitials, bio: String(bio || "").trim(),
    photo: photo ? String(photo).trim() : undefined,
  });
  invalidate("team");
  return Response.json({ success: true, data: newMember }, { status: 201 });
}, "Erreur lors de l'ajout du membre.");
