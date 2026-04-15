export function processMetadata(metadata = {}) {
  if (!metadata || typeof metadata !== "object") return []

  const result = []

  Object.entries(metadata).forEach(([key, meta]) => {
    if (!meta || !meta.values) return

    const values = meta.values.map(v => {
      // Prioridad 1: Texto amigable (@value)
      const rawValue = v?.["@value"] ?? v?.value ?? v
      const label = v?.label ?? rawValue

      // Si tiene @value, lo forzamos como TEXTO para ignorar la URI técnica
      if (v?.["@value"]) {
        return { type: "text", value: rawValue }
      }

      // Si es un recurso interno (ID numérico)
      if (v?.type === "resource" || (v?.["@id"] && !isNaN(v["@id"]))) {
        return { 
          type: "resource", 
          value: v["@id"] || v.value, 
          label: label 
        }
      }

      // Si es un link externo real
      if (typeof rawValue === "string" && rawValue.startsWith("http")) {
        return { type: "link", value: rawValue }
      }

      return { type: "text", value: label }
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