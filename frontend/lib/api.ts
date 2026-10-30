// The API is served by this Next.js app (app/api/*); override only to use another server
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

// ─── Auth token helpers ───────────────────────────────────────────────────────

export function getAdminToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("epsigate_admin_token") || "";
}

export function saveAdminToken(token: string): void {
  localStorage.setItem("epsigate_admin_token", token);
}

export function clearAdminToken(): void {
  localStorage.removeItem("epsigate_admin_token");
  localStorage.removeItem("epsigate_admin_session");
}

/** Returns the Authorization header object when a token is present. */
function authHeaders(): Record<string, string> {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Image helpers ────────────────────────────────────────────────────────────

export function resolveImageUrl(src: string | undefined | null, fallback = "/wedding.jpg"): string {
  if (!src || src.trim() === "") return fallback;
  const trimmed = src.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }
  if (trimmed.startsWith("/uploads/")) {
    // Empty origin when the API is served by this app: the path stays relative
    const backendOrigin = API_BASE_URL.replace(/\/api\/?$/, "");
    return `${backendOrigin}${trimmed}`;
  }
  return trimmed;
}

/** Hosts that next/image may optimize (see images.remotePatterns in next.config.ts). */
function canOptimizeImage(src: string): boolean {
  if (src.startsWith("/")) return true;
  try {
    return new URL(src).hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

/**
 * Props for next/image: resolved src, and optimization (resizing, WebP) only for
 * local and Vercel Blob images — other URLs typed in the admin are shown as-is.
 */
export function imageProps(src: string | undefined | null, fallback?: string): { src: string; unoptimized: boolean } {
  const resolved = resolveImageUrl(src, fallback);
  return { src: resolved, unoptimized: !canOptimizeImage(resolved) };
}

// ─── Generic fetch wrapper ────────────────────────────────────────────────────

export async function fetchApi<T = unknown>(
  endpoint: string,
  options?: RequestInit
): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
        ...(options?.headers || {}),
      },
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: json.error || `Erreur HTTP ${res.status}` };
    }
    return { ok: true, data: json.data || json };
  } catch (err) {
    console.error(`API Fetch Error on ${endpoint}:`, err);
    return { ok: false, error: "Impossible de communiquer avec le backend." };
  }
}

// ─── Upload helper ────────────────────────────────────────────────────────────

// The server accepts up to 4 MB (Vercel limit): bigger photos are shrunk in the browser
const MAX_UPLOAD_BYTES = 3.5 * 1024 * 1024;
// Wide enough for full-screen display on large and high-density screens
const MAX_DIMENSION = 2560;

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

// Formats the server stores as-is; anything else the browser can read is converted to JPEG
const SERVER_FORMATS = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

/** A file the browser cannot prepare: its message is shown to the admin as-is. */
class UploadError extends Error {}

function withJpegName(file: File): string {
  return file.name.replace(/\.[^.]+$/, "") + ".jpg";
}

function extensionOf(file: File): string {
  return /\.([a-z0-9]+)$/i.exec(file.name)?.[1].toUpperCase() || "inconnu";
}

/**
 * iPhone photos: Chrome, Edge and Firefox cannot read HEIC, Safari can. Checked
 * on the content too ("ftyp" box brand), as the name and type are not reliable.
 */
async function isHeicFile(file: File): Promise<boolean> {
  if (/^image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name)) return true;
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const ascii = String.fromCharCode(...head);
  return ascii.slice(4, 8) === "ftyp" && /^(hei[cmsx]|hev[cmsx]|mif1|msf1)$/.test(ascii.slice(8, 12));
}

async function heicToJpeg(file: File): Promise<File> {
  // Loaded only when needed (~3 MB decoder); the "csp" build runs without eval
  const { heicTo } = await import("heic-to/csp");
  const jpeg = await heicTo({ blob: file, type: "image/jpeg", quality: 0.9 });
  return new File([jpeg], withJpegName(file), { type: "image/jpeg" });
}

/**
 * Converts HEIC and other unusual formats to JPEG, and resizes/recompresses a
 * photo that is too large or too heavy (camera and phone photos are often
 * 5–15 MB). Small JPG/PNG/WebP/AVIF files and GIFs are sent unchanged.
 */
export async function prepareImageForUpload(file: File): Promise<File> {
  if (file.type === "image/gif" || typeof createImageBitmap !== "function") return file;

  let bitmap: ImageBitmap;
  try {
    // Applies the EXIF orientation, so portrait phone photos stay upright
    bitmap = await createImageBitmap(file);
  } catch {
    if (!(await isHeicFile(file))) {
      throw new UploadError(
        `Ce fichier (format ${extensionOf(file)}) n'est pas une image lisible. Choisissez une photo JPG, PNG, WebP ou HEIC.`
      );
    }
    try {
      file = await heicToJpeg(file);
      bitmap = await createImageBitmap(file);
    } catch (err) {
      console.error("HEIC conversion failed:", err);
      throw new UploadError(
        `Impossible de convertir cette photo HEIC (${String(err).slice(0, 120)}). ` +
          "Exportez-la en JPG ou, sur iPhone, choisissez Réglages > Appareil photo > Formats > « Le plus compatible »."
      );
    }
  }

  const needsConversion = !SERVER_FORMATS.includes(file.type.toLowerCase());
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= MAX_UPLOAD_BYTES && !needsConversion) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  // JPEG has no transparency: white background for PNGs
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  for (const quality of [0.9, 0.82, 0.72]) {
    const blob = await canvasToJpeg(canvas, quality);
    if (blob && blob.size <= MAX_UPLOAD_BYTES) {
      return new File([blob], withJpegName(file), { type: "image/jpeg" });
    }
  }
  return file; // Still too heavy: the server answers with a clear message
}

export async function uploadImage(
  file: File
): Promise<{ ok: boolean; url?: string; error?: string }> {
  let prepared: File;
  try {
    prepared = await prepareImageForUpload(file);
  } catch (err) {
    return { ok: false, error: err instanceof UploadError ? err.message : "Impossible de lire cette image." };
  }

  try {
    const formData = new FormData();
    formData.append("image", prepared);

    const res = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      headers: authHeaders(),
      body: formData,
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) {
      return {
        ok: false,
        error: json.error || "Erreur lors du téléversement de l'image.",
      };
    }

    return { ok: true, url: json.data.url };
  } catch (err) {
    console.error("Upload API error:", err);
    return {
      ok: false,
      error: "Erreur réseau : impossible de joindre le serveur d'upload.",
    };
  }
}
