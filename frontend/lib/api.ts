export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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
    const backendOrigin = API_BASE_URL.replace(/\/api\/?$/, "");
    return `${backendOrigin}${trimmed}`;
  }
  return trimmed;
}

// ─── Generic fetch wrapper ────────────────────────────────────────────────────

export async function fetchApi<T = any>(
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

export async function uploadImage(
  file: File
): Promise<{ ok: boolean; url?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append("image", file);

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
