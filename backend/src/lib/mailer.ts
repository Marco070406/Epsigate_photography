/**
 * mailer.ts — Nodemailer transport + email templates
 *
 * Configure via .env :
 *   SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS
 *   EMAIL_FROM   — adresse expéditeur (ex: noreply@epsigate-photography.com)
 *   EMAIL_ADMIN  — adresse qui reçoit les notifications (ex: contact@epsigate-photography.com)
 */
import nodemailer, { type Transporter } from "nodemailer";
import type { MessageItem } from "../data/db";

// ─── Transport ────────────────────────────────────────────────────────────────

let _transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (_transporter) return _transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = process.env.SMTP_SECURE === "true"; // true → port 465
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "Configuration SMTP incomplète : vérifiez SMTP_HOST, SMTP_USER et SMTP_PASS dans .env"
    );
  }

  _transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: process.env.NODE_ENV === "production" },
  });

  return _transporter;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FROM = () =>
  `"Epsigate Photography" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`;
const ADMIN_EMAIL = () => process.env.EMAIL_ADMIN || process.env.SMTP_USER || "";

const PURPOSE_LABELS: Record<string, string> = {
  devis: "Demande de devis personnalisé",
  reservation: "Réservation de séance photo",
  infos: "Informations générales",
  partenariat: "Partenariat & Presse",
};

const SERVICE_LABELS: Record<string, string> = {
  mariage: "Mariage",
  mode: "Mode & Fashion",
  portrait: "Portrait",
  evenementiel: "Événementiel",
  commercial: "Commercial",
  studio: "Studio",
  autre: "Autre / Non précisé",
};

function labelOf(map: Record<string, string>, key: string): string {
  return map[key?.toLowerCase()] || key || "–";
}

// ─── Shared layout wrapper ────────────────────────────────────────────────────

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin:0; padding:0; background:#0f0d0e; font-family:'Segoe UI',Arial,sans-serif; color:#d1cbd0; }
    .wrap { max-width:600px; margin:40px auto; background:#1a1517; border-radius:12px; overflow:hidden; }
    .header { background:linear-gradient(135deg,#3d1a22 0%,#1a1517 100%); padding:32px 40px; text-align:center; border-bottom:2px solid #8b1a2e; }
    .header h1 { margin:0; font-size:1.5rem; color:#ffffff; letter-spacing:0.05em; }
    .header p  { margin:6px 0 0; font-size:0.85rem; color:#d4af37; letter-spacing:0.12em; text-transform:uppercase; }
    .body { padding:32px 40px; }
    .body h2 { font-size:1.15rem; color:#ffffff; margin:0 0 16px; }
    .body p  { font-size:0.92rem; line-height:1.7; margin:0 0 12px; color:#d1cbd0; }
    .field-table { width:100%; border-collapse:collapse; margin:16px 0; }
    .field-table td { padding:9px 12px; font-size:0.88rem; border-bottom:1px solid rgba(255,255,255,0.07); vertical-align:top; }
    .field-table td:first-child { color:#a39ba2; width:36%; white-space:nowrap; }
    .field-table td:last-child  { color:#ffffff; font-weight:500; }
    .message-box { background:rgba(0,0,0,0.25); border-left:3px solid #8b1a2e; border-radius:4px; padding:14px 16px; margin:16px 0; font-size:0.9rem; line-height:1.7; color:#e8e0e6; white-space:pre-wrap; }
    .cta { display:inline-block; background:#8b1a2e; color:#ffffff!important; text-decoration:none; padding:12px 28px; border-radius:6px; font-size:0.9rem; font-weight:600; margin:16px 0; }
    .footer { background:#0f0d0e; padding:20px 40px; text-align:center; font-size:0.78rem; color:#6b6168; border-top:1px solid rgba(255,255,255,0.06); }
    .gold { color:#d4af37; }
    @media(max-width:480px){ .body,.header,.footer{padding:20px;} }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <h1>EPSIGATE PHOTOGRAPHY</h1>
      <p>Studio Professionnel • Lomé, Togo</p>
    </div>
    <div class="body">${body}</div>
    <div class="footer">
      © ${new Date().getFullYear()} Epsigate Photography – Lomé, Togo<br/>
      Cet email a été généré automatiquement, merci de ne pas y répondre directement.
    </div>
  </div>
</body>
</html>`;
}

// ─── Template 1 : confirmation au client ─────────────────────────────────────

function confirmationHtml(msg: MessageItem): string {
  const body = `
    <h2>Bonjour ${msg.name},</h2>
    <p>Nous avons bien reçu votre demande et nous vous en remercions.</p>
    <p>Notre équipe prendra contact avec vous dans les <strong class="gold">24 à 48 heures</strong> pour donner suite à votre projet.</p>

    <table class="field-table">
      <tr><td>Nature de la demande</td><td>${labelOf(PURPOSE_LABELS, msg.purpose)}</td></tr>
      <tr><td>Prestation souhaitée</td><td>${labelOf(SERVICE_LABELS, msg.service)}</td></tr>
      ${msg.date ? `<tr><td>Date envisagée</td><td>${msg.date}</td></tr>` : ""}
      <tr><td>Téléphone renseigné</td><td>${msg.phone}</td></tr>
    </table>

    <p style="color:#a39ba2;font-size:0.85rem;">Votre message :</p>
    <div class="message-box">${msg.message}</div>

    <p>Pour toute urgence, vous pouvez également nous joindre directement sur WhatsApp.</p>
    <p>À très bientôt,<br/><strong class="gold">L'équipe Epsigate Photography</strong></p>`;

  return layout("Votre demande a été reçue – Epsigate Photography", body);
}

function confirmationText(msg: MessageItem): string {
  return `Bonjour ${msg.name},

Nous avons bien reçu votre demande et nous vous en remercions.
Notre équipe vous recontactera sous 24 à 48 heures.

Récapitulatif :
- Nature     : ${labelOf(PURPOSE_LABELS, msg.purpose)}
- Prestation : ${labelOf(SERVICE_LABELS, msg.service)}
${msg.date ? `- Date       : ${msg.date}\n` : ""}- Téléphone  : ${msg.phone}

Votre message :
${msg.message}

À très bientôt,
L'équipe Epsigate Photography
Lomé, Togo`;
}

// ─── Template 2 : notification admin ─────────────────────────────────────────

function notificationHtml(msg: MessageItem, adminUrl: string): string {
  const body = `
    <h2>Nouveau message reçu</h2>
    <p>Un client vient de soumettre une demande via le formulaire de contact.</p>

    <table class="field-table">
      <tr><td>Nom</td><td>${msg.name}</td></tr>
      <tr><td>Email</td><td>${msg.email}</td></tr>
      <tr><td>Téléphone</td><td>${msg.phone}</td></tr>
      <tr><td>Nature</td><td>${labelOf(PURPOSE_LABELS, msg.purpose)}</td></tr>
      <tr><td>Prestation</td><td>${labelOf(SERVICE_LABELS, msg.service)}</td></tr>
      ${msg.date ? `<tr><td>Date souhaitée</td><td>${msg.date}</td></tr>` : ""}
      <tr><td>Reçu le</td><td>${new Date(msg.createdAt).toLocaleString("fr-FR", { timeZone: "Africa/Lome" })}</td></tr>
    </table>

    <p style="color:#a39ba2;font-size:0.85rem;">Message du client :</p>
    <div class="message-box">${msg.message}</div>

    <a href="${adminUrl}" class="cta">Ouvrir dans l'administration →</a>`;

  return layout(`[Nouveau devis] ${msg.name} – ${msg.service}`, body);
}

function notificationText(msg: MessageItem): string {
  return `Nouveau message reçu sur Epsigate Photography

Nom      : ${msg.name}
Email    : ${msg.email}
Téléphone: ${msg.phone}
Nature   : ${labelOf(PURPOSE_LABELS, msg.purpose)}
Prestation: ${labelOf(SERVICE_LABELS, msg.service)}
${msg.date ? `Date     : ${msg.date}\n` : ""}
Message :
${msg.message}`;
}

// ─── Template 3 : réponse admin → client ─────────────────────────────────────

function replyHtml(clientName: string, replyText: string): string {
  const body = `
    <h2>Réponse d'Epsigate Photography</h2>
    <p>Bonjour ${clientName},</p>
    <div class="message-box">${replyText.replace(/\n/g, "<br/>")}</div>
    <p>N'hésitez pas à nous contacter si vous avez d'autres questions.</p>
    <p>Cordialement,<br/><strong class="gold">L'équipe Epsigate Photography</strong></p>`;

  return layout("Réponse à votre demande – Epsigate Photography", body);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Email de confirmation envoyé au client après soumission du formulaire.
 */
export async function sendContactConfirmation(msg: MessageItem): Promise<void> {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: FROM(),
    to: msg.email,
    subject: "Votre demande a été reçue – Epsigate Photography",
    text: confirmationText(msg),
    html: confirmationHtml(msg),
  });
}

/**
 * Notification envoyée à l'admin dès qu'un nouveau message est soumis.
 */
export async function sendAdminNotification(msg: MessageItem): Promise<void> {
  const adminEmail = ADMIN_EMAIL();
  if (!adminEmail) return; // silencieux si non configuré

  const adminUrl =
    (process.env.CORS_ORIGIN || "http://localhost:3000") + "/admin";

  const transporter = getTransporter();
  await transporter.sendMail({
    from: FROM(),
    to: adminEmail,
    subject: `[Nouveau devis] ${msg.name} – ${labelOf(SERVICE_LABELS, msg.service)}`,
    text: notificationText(msg),
    html: notificationHtml(msg, adminUrl),
  });
}

/**
 * Réponse directe de l'admin vers le client, déclenchée depuis l'interface d'administration.
 */
export async function sendReply(
  clientEmail: string,
  clientName: string,
  replyText: string
): Promise<void> {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: FROM(),
    to: clientEmail,
    subject: "Réponse à votre demande – Epsigate Photography",
    text: replyText,
    html: replyHtml(clientName, replyText),
  });
}
