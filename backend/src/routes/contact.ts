import { Router, Request, Response } from "express";
import { addMessage } from "../data/db";

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s\-().]{6,20}$/;

router.post("/", async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, phone, purpose, service, date, message, honeypot } = req.body;

    if (honeypot) {
      return res.status(200).json({ success: true, message: "Demande reçue" });
    }

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: "Veuillez remplir tous les champs obligatoires." });
    }

    if (!EMAIL_RE.test(String(email).trim())) {
      return res.status(400).json({ error: "Adresse email invalide." });
    }

    if (!PHONE_RE.test(String(phone).trim())) {
      return res.status(400).json({ error: "Numéro de téléphone invalide." });
    }

    const saved = await addMessage({
      name:    String(name).trim(),
      email:   String(email).trim().toLowerCase(),
      phone:   String(phone).trim(),
      purpose: String(purpose || "devis").trim(),
      service: String(service || "autre").trim(),
      date:    date ? String(date).trim() : undefined,
      message: String(message).trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Votre demande a bien été transmise à Epsigate Photography.",
      data: saved,
    });
  } catch (error) {
    console.error("Error creating contact message:", error);
    return res.status(500).json({ error: "Erreur lors de l'enregistrement du message." });
  }
});

export default router;
