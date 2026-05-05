const API_BASE = "https://arcadium.cluster24.libnamic.eu"

const buildUrl = (url) => {
  if (!url) return null
  if (url.startsWith("http")) return url
  return `${API_BASE}${url}`
}

const getMediaType = (mimetype = "") => {
  if (mimetype.startsWith("image")) return "image"
  if (mimetype.startsWith("video")) return "video"
  if (mimetype.startsWith("audio")) return "audio"
  if (mimetype === "application/pdf") return "pdf"
  return "other"
}

export function normalizeRecord(record = {}) {

  const mediaItems = (record.media_items || [])
    .map(m => {
      const att = m?.attachment
      if (!att) return null

      const full = buildUrl(att.url)

      const thumbnail = buildUrl(
        att.variants?.medium || att.variants?.small
      ) || full

      const type = getMediaType(att.mimetype)

      return {
        id: m.id,
        title: att.title || "Sin título",
        full,
        thumbnail,
        mimetype: att.mimetype,
        type, 
        isPdf: type === "pdf"
      }
    })
    .filter(Boolean)

  return {
    ...record,

    displayTitle: record.title || "Sin título",

    mediaItems,

    canonicalMetadata: record.canonical_joined_metadata || {},
    joinedMetadata: record.joined_metadata || {},

    imageDisplay: buildUrl(record.preview || record.thumbnail)
  }
}