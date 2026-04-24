const API_BASE = "https://arcadium.cluster24.libnamic.eu"

export function normalizeRecord(record = {}) {
  const mediaItems = (record.media_items || [])
    .map(m => {
      const att = m?.attachment
      if (!att) return null

      const full = att.url
        ? API_BASE + att.url
        : null

      const thumbnail = att.variants?.medium
        ? API_BASE + att.variants.medium
        : full

      return {
        id: m.id,
        title: att.title || "Sin título",
        thumbnail,
        full,
        mimetype: att.mimetype,
        isPdf: att.mimetype === "application/pdf"
      }
    })
    .filter(Boolean)

  return {
    ...record,
    displayTitle: record.title || "Sin título",
    mediaItems,

    canonicalMetadata: record.canonical_joined_metadata || {},
    joinedMetadata: record.joined_metadata || {},

    imageDisplay: record.preview
      ? API_BASE + record.preview
      : record.thumbnail
        ? API_BASE + record.thumbnail
        : null
  }
}