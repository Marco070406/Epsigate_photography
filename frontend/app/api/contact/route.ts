import { after } from "next/server";
import { api, jsonError, readJson } from "@/lib/server/http";
import { addMessage } from "@/lib/server/db";
import { sendContactConfirmation, sendAdminNotification } from "@/lib/server/mailer";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+()./\s-]{6,30}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Max lengths aligned with the database columns
const MAX = { name: 255, email: 255, purpose: 50, service: 50, message: 5000 };

export const POST = api(async (req: Request) => {
  const body = await readJson(req);
  if (!body) return jsonError("Requête invalide.", 400);
  const { name, email, phone, purpose, service, date, message, honeypot } = body;

  if (honeypot) {
    return Response.json({ success: true, message: "Demande reçue" });
  }

  if (!name || !email || !phone || !message) {
    return jsonError("Veuillez remplir tous les champs obligatoires.", 400);
  }

  if (!EMAIL_RE.test(String(email).trim())) {
    return jsonError("Adresse email invalide.", 400);
  }

  if (!PHONE_RE.test(String(phone).trim())) {
    return jsonError("Numéro de téléphone invalide.", 400);
  }

  if (String(name).trim().length > MAX.name || String(email).trim().length > MAX.email) {
    return jsonError("Nom ou email trop long.", 400);
  }

  if (String(message).trim().length > MAX.message) {
    return jsonError(`Le message ne doit pas dépasser ${MAX.message} caractères.`, 400);
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

  // Emails sent after the response; after() keeps the function alive until they finish
  after(async () => {
    const results = await Promise.allSettled([
      sendContactConfirmation(saved),
      sendAdminNotification(saved),
    ]);
    for (const r of results) {
      if (r.status === "rejected") console.error("Email sending error:", r.reason);
    }
  });

  return Response.json(
    {
      success: true,
      message: "Votre demande a bien été transmise à Epsigate Photography.",
      data: saved,
    },
    { status: 201 }
  );
}, "Erreur lors de l'enregistrement du message.");
