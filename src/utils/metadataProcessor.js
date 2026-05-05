export const processMetadata = (metadata = {}) => {
  const rows = []

  Object.values(metadata).forEach(field => {
    const values = field.values || []

    const processedValues = values.map(v => {

      //console.log("VALUE FULL:", v)

      // =========================
      // LITERAL
      // =========================
      if (v.type === "literal") {
        return {
          type: "text",
          value: v["@value"]
        }
      }

      // =========================
      // URI (link directo)
      // =========================
      if (v.type === "uri") {
        return {
          type: "link",
          value: v["@id"],
          label: v.label || v["@id"]
        }
      }

      // =========================
      // AUTHORITY (wikidata, etc)
      // =========================
      if (v.type === "authority") {
        return {
          type: "link",
          value: v.uri,
          label: v.label
        }
      }

      // =========================
      // RESOURCE (interno)
      // =========================
      if (v.type === "resource") {

        // RECORD
        if (v.model === "glam.record") {
          return {
            type: "resource",
            value: {
              type: "record",
              id: v.id,
              title: v.label
            },
            label: v.label
          }
        }

        // COLLECTION
        if (v.model === "glam.collection") {
          return {
            type: "resource",
            value: {
              type: "collection",
              id: v.id,
              title: v.label
            },
            label: v.label
          }
        }

        // MEDIA
        if (v.model === "glam.media") {
          return {
            type: "resource",
            value: {
              type: "medio",
              id: v.id,
              title: v.label
            },
            label: v.label
          }
        }
      }

      // =========================
      // VOCABULARY
      // =========================
      if (v.type === "vocabulary") {
        return {
          type: "text",
          value: v.label
        }
      }

      // =========================
      // FALLBACK
      // =========================
      return {
        type: "text",
        value: v.label || v["@value"] || JSON.stringify(v)
      }
    })

    rows.push({
      label: field.label,
      values: processedValues
    })
  })

  return rows
}