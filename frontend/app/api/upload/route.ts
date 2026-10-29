import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { put } from "@vercel/blob";
import { api, jsonError } from "@/lib/server/http";
import { requireAdmin } from "@/lib/server/auth";

// Extension derived from the MIME type: a file named "x.html" can never be served as HTML
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/gif": ".gif",
};

// Vercel Functions accept request bodies up to 4.5 MB
const MAX_SIZE = 4 * 1024 * 1024;

function buildFilename(file: File, ext: string): string {
  const sanitizedBase =
    path.basename(file.name, path.extname(file.name))
      .replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase().slice(0, 60) || "image";
  return `${sanitizedBase}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`;
}

export const POST = api(async (req: Request) => {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const form = await req.formData().catch(() => null);
  const file = form?.get("image");
  if (!(file instanceof File)) return jsonError("Aucun fichier image téléversé.", 400);

  const ext = EXTENSIONS[file.type.toLowerCase()];
  if (!ext) return jsonError("Format non supporté. Choisissez une image JPG, PNG, WebP ou AVIF.", 400);
  if (file.size > MAX_SIZE) return jsonError("Image trop volumineuse (4 Mo maximum).", 400);

  const filename = buildFilename(file, ext);
  let url: string;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    // Vercel's filesystem is read-only: images are stored in Vercel Blob
    const blob = await put(`uploads/${filename}`, file, { access: "public", contentType: file.type });
    url = blob.url;
  } else {
    // Local development: saved in public/uploads, served by Next
    const dir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
    url = `/uploads/${filename}`;
  }

  return Response.json(
    {
      success: true,
      message: "Image téléversée avec succès.",
      data: { url, relativePath: `/uploads/${filename}`, filename, size: file.size, mimetype: file.type },
    },
    { status: 201 }
  );
}, "Erreur lors du téléversement de l'image.");
