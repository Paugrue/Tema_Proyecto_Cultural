const API_BASE = "https://arcadium.cluster24.libnamic.eu"

function cleanUrl(url) {
  if (!url || typeof url !== "string") return null

  return url
    .replace(/([?&])size=(small|medium|large)/g, "")
    .replace(/[?&]$/, "")
}

export function imageSize(url, size = "medium") {
  const base = cleanUrl(url)
  if (!base) return "/placeholder.png"

  const finalUrl = base.startsWith("http")
    ? base
    : `${API_BASE}${base.startsWith("/") ? "" : "/"}${base}`

  return finalUrl.includes("?")
    ? `${finalUrl}&size=${size}`
    : `${finalUrl}?size=${size}`
}