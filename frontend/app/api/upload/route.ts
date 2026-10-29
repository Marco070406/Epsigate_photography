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

/** Checks the file's first bytes: the declared MIME type alone can be forged. */
function looksLikeImage(bytes: Buffer, mime: string): boolean {
  const ascii = (start: number, end: number) => bytes.subarray(start, end).toString("latin1");
  switch (mime) {
    case "image/jpeg":
    case "image/jpg":
      return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    case "image/png":
      return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    case "image/gif":
      return ascii(0, 6) === "GIF87a" || ascii(0, 6) === "GIF89a";
    case "image/webp":
      return ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP";
    case "image/avif":
      return ascii(4, 8) === "ftyp" && /^avi[fs]$/.test(ascii(8, 12));
    default:
      return false;
  }
}

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

  const bytes = Buffer.from(await file.arrayBuffer());
  if (!looksLikeImage(bytes, file.type.toLowerCase())) {
    return jsonError("Le fichier n'est pas une image valide.", 400);
  }

  const filename = buildFilename(file, ext);
  let url: string;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    // Vercel's filesystem is read-only: images are stored in Vercel Blob
    const blob = await put(`uploads/${filename}`, bytes, {
      access: "public",
      contentType: file.type,
      // Unique filenames never change: let browsers and the CDN keep them a year
      cacheControlMaxAge: 365 * 24 * 60 * 60,
    });
    url = blob.url;
  } else {
    // Local development: saved in public/uploads, served by Next
    const dir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, filename), bytes);
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
