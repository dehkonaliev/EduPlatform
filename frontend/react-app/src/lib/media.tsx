/**
 * Thumbnails/photos come back as relative paths (e.g. "/media/users/x.jpg"),
 * not full URLs. This resolves them against your Django origin — derived
 * from VITE_API_BASE_URL by stripping the trailing "/api", since media files
 * are served from the site root, not under /api.
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";
const ORIGIN = API_BASE.replace(/\/api\/?$/, "");

export function resolveMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}