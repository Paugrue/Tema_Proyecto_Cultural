const API_BASE = "https://arcadium.cluster24.libnamic.eu";

function normalizeImage(img) {
  if (!img || typeof img !== "string") return "/placeholder.png";

  let cleanPath = img.trim();

  if (cleanPath.startsWith("http")) return cleanPath;

  cleanPath = cleanPath.startsWith("/")
    ? cleanPath.substring(1)
    : cleanPath;

  return `${API_BASE}/${cleanPath}`;
}

export function normalizeRecord(record = {}) {
  const rawMedia = record.media_items || record.media || [];

  const mediaItems = Array.isArray(rawMedia)
    ? rawMedia.map(m => {
        const id = m?.[0] ?? null;
        const title = m?.[1] || "Sin título";
        const url = m?.[2] || "";

        const normalizedUrl = normalizeImage(url);

        return {
          id,
          title,
          thumbnail: normalizedUrl,

          // 👇 IMPORTANTE: NO modificar la URL
          full: normalizedUrl,

          // opcional: para debug
          rawUrl: url
        };
      })
    : [];

  return {
    ...record,
    displayTitle: record.title || "Sin título",
    imageDisplay: normalizeImage(record.preview || record.thumbnail),
    mediaItems,
    canonicalMetadata: record.canonical_joined_metadata || {},
    joinedMetadata: record.joined_metadata || {}
  };
}