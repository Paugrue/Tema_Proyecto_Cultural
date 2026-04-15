const API_BASE = "https://arcadium.cluster24.libnamic.eu"

function cleanUrl(url) {
  if (!url || typeof url !== "string") return null

  return url
    .replace(/([?&])size=(small|medium|large)/g, "") // elimina size existente
    .replace(/[?&]$/, "") // limpia restos
}

export function imageSize(url, size = "medium") {
  const base = cleanUrl(url)
  if (!base) return "/placeholder.png"

  const isAbsolute = base.startsWith("http")

  const finalUrl = isAbsolute
    ? base
    : `${API_BASE}/${base}`

  // añadimos size de forma segura
  return finalUrl.includes("?")
    ? `${finalUrl}&size=${size}`
    : `${finalUrl}?size=${size}`
}