import { Router, Request, Response } from "express";
import { getTeam, addTeamMember, updateTeamMember, deleteTeamMember } from "../data/db";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.get("/", async (_req: Request, res: Response): Promise<any> => {
  try {
    res.json({ success: true, data: await getTeam() });
  } catch {
    res.status(500).json({ error: "Impossible de récupérer l'équipe." });
  }
});

router.post("/", requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, role, initials, bio, photo } = req.body;
    if (!name || !role) return res.status(400).json({ error: "Nom et rôle requis." });
    const calculatedInitials = initials || name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
    const newMember = await addTeamMember({
      name: String(name).trim(), role: String(role).trim(),
      initials: calculatedInitials, bio: String(bio || "").trim(),
      photo: photo ? String(photo).trim() : undefined,
    });
    return res.status(201).json({ success: true, data: newMember });
  } catch {
    return res.status(500).json({ error: "Erreur lors de l'ajout du membre." });
  }
});

router.put("/:id", requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, role, initials, bio, photo } = req.body;
    const updated = await updateTeamMember(req.params.id, {
      ...(name !== undefined && { name: String(name).trim() }),
      ...(role !== undefined && { role: String(role).trim() }),
      ...(initials !== undefined && { initials: String(initials).trim() }),
      ...(bio !== undefined && { bio: String(bio).trim() }),
      ...(photo !== undefined && { photo: String(photo).trim() }),
    });
    if (!updated) return res.status(404).json({ error: "Membre introuvable." });
    return res.json({ success: true, data: updated });
  } catch {
    return res.status(500).json({ error: "Erreur lors de la mise à jour." });
  }
});

router.delete("/:id", requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const deleted = await deleteTeamMember(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Membre introuvable." });
    return res.json({ success: true, message: "Membre retiré de l'équipe." });
  } catch {
    return res.status(500).json({ error: "Erreur lors de la suppression." });
  }
});

export default router;
