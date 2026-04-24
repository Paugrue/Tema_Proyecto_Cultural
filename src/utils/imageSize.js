const API_BASE = "https://arcadium.cluster24.libnamic.eu"

function cleanUrl(url) {
  if (!url || typeof url !== "string") return null

  return url
    .trim()
    .replace(/\s/g, "")
    .replace(/size=(small|medium|large)/g, "")
    .replace(/[?&]$/, "")
}

export function imageSize(url, size = "medium") {
  if (!url || typeof url !== "string") return "/placeholder.png"

  // 🔥 SI ES PROXY → NO TOCAR
  if (url.startsWith("/api-proxy")) {
    return url
  }

  let finalUrl = url.trim()

  // solo añadir base si es relativa REAL (no proxy)
  if (!finalUrl.startsWith("http") && !finalUrl.startsWith("/api")) {
    finalUrl = `${API_BASE}${finalUrl.startsWith("/") ? "" : "/"}${finalUrl}`
  }

  // no duplicar size
  if (finalUrl.includes("size=")) return finalUrl

  const joinChar = finalUrl.includes("?") ? "&" : "?"
  return `${finalUrl}${joinChar}size=${size}`
}