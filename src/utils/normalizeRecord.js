export function normalizeRecord(record) {
  return {
    id: record.id,
    title: record.metadata_fields?.["dcterms:title"]?.[0]?.["@value"] || "Sin título",
    author: record.metadata_fields?.["dcterms:creator"]?.[0]?.["@value"] || null,
    year: record.metadata_fields?.["dcterms:date"]?.[0]?.["@value"] || null,
    description: record.metadata_fields?.["dcterms:description"]?.[0]?.["@value"] || "",
    thumbnail: record.thumbnail,
    collections: record.collections_titles
  }
}