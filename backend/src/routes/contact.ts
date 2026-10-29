import { Router, Request, Response } from "express";
import { addMessage } from "../data/db";
import { sendContactConfirmation, sendAdminNotification } from "../lib/mailer";

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+()./\s-]{6,30}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Max lengths aligned with the database columns
const MAX = { name: 255, email: 255, purpose: 50, service: 50, message: 5000 };

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

    if (String(name).trim().length > MAX.name || String(email).trim().length > MAX.email) {
      return res.status(400).json({ error: "Nom ou email trop long." });
    }

    if (String(message).trim().length > MAX.message) {
      return res.status(400).json({ error: `Le message ne doit pas dépasser ${MAX.message} caractères.` });
    }

    const trimmedDate = date ? String(date).trim() : "";

    const saved = await addMessage({
      name:    String(name).trim(),
      email:   String(email).trim().toLowerCase(),
      phone:   String(phone).trim(),
      purpose: String(purpose || "devis").trim().slice(0, MAX.purpose),
      service: String(service || "autre").trim().slice(0, MAX.service),
      // Invalid dates are ignored rather than crashing the DATE column insert
      date:    DATE_RE.test(trimmedDate) && !isNaN(Date.parse(trimmedDate)) ? trimmedDate : undefined,
      message: String(message).trim(),
    });

    // Emails envoyés avant de répondre : sur Vercel la fonction peut être suspendue
    // dès la réponse envoyée. Un échec d'envoi n'empêche pas l'enregistrement.
    const results = await Promise.allSettled([
      sendContactConfirmation(saved),
      sendAdminNotification(saved),
    ]);
    for (const r of results) {
      if (r.status === "rejected") console.error("Email sending error:", r.reason);
    }

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
