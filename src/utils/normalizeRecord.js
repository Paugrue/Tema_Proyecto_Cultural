const API_BASE = "https://arcadium.cluster24.libnamic.eu"

/**
 * Extrae texto de estructuras RDF / arrays / objetos mixtos
 */
function getMetaValue(field) {
  if (!field) return ""

  if (Array.isArray(field)) {
    return field?.[0]?.["@value"] || field?.[0]?.value || ""
  }

  if (typeof field === "object") {
    return field["@value"] || field.value || ""
  }

  return field
}

/**
 * Normaliza URL de imagen
 */
function normalizeImage(img) {
  if (!img) return null
  if (typeof img !== "string") return null

  const clean = img.trim()

  if (!clean || clean === "/placeholder.png") return null

  if (clean.startsWith("http")) return clean

  return `${API_BASE}${clean.startsWith("/") ? "" : "/"}${clean}`
}

/**
 * NORMALIZADOR PRINCIPAL
 */
export function normalizeRecord(record = {}) {
  const meta = record.metadata_fields || {}

  const title = getMetaValue(meta["dcterms:title"] || record.title)
  const author = getMetaValue(meta["dcterms:creator"])
  const year = getMetaValue(meta["dcterms:date"])
  const description =
    getMetaValue(meta["dcterms:description"]) || record.description || ""

  const image =
    normalizeImage(record.preview) ||
    normalizeImage(record.thumbnail) ||
    normalizeImage(record.image)

  const collections =
    record.collections_titles ||
    record.collections ||
    []

  const cleanCollections = Array.isArray(collections)
    ? collections.join(" • ")
    : String(collections || "").split(",").join(" • ")

  return {
    ...record,

    // identidad
    id: record.id,

    // contenido
    displayTitle: title || "Sin título",
    displayAuthor: author || null,
    displayYear: year || null,
    displayDescription: description,

    // imagen (clave para tu bug)
    imageDisplay: image,

    // colecciones
    cleanCollections
  }
}