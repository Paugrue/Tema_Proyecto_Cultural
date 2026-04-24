export function processMetadata(metadata = {}) {
  if (!metadata || typeof metadata !== "object") return []

  const result = []

  Object.entries(metadata).forEach(([key, meta]) => {
    if (!meta || !meta.values) return

    const cleanValues = Array.isArray(meta.values)
      ? meta.values.filter(v => v !== undefined && v !== null && v !== "")
      : []

    const values = cleanValues.map(v => {
      // string directo
      if (typeof v === "string") {
        return { type: "text", value: v }
      }

      const raw = v?.["@value"] ?? v?.value ?? v
      const label = v?.label ?? raw

      // link externo
      if (typeof raw === "string" && raw.startsWith("http")) {
        return { type: "link", value: raw }
      }

      // resource interno
      if (v?.type === "resource" && v?.["@id"]) {
        return {
          type: "resource",
          value: String(v["@id"]),
          label
        }
      }

      // fallback texto
      return { type: "text", value: String(label) }
    })

    if (values.length) {
      result.push({
        label: meta.label || key,
        values
      })
    }
  })

  return result
}