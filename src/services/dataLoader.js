const API_BASE = 'https://arcadium.cluster24.libnamic.eu'

export async function loadCulturalData(type, source = 'dune', options = {}) {
  // type: 'collections' | 'records'
  // source: 'dune', 'otro-producto', etc.
  // options.prefix (boolean): if true the returned ids will be prefixed with the
  // source string (eg. "dune-r1"). Defaults to false because the components
  // that consume the data assume the raw id from the JSON file.
  const { prefix = false } = options
  try {
    const res = await fetch(`/data/${source}-${type}.json`)
    const json = await res.json()
    return json.map(item => ({
      ...item,
      id: prefix ? `${source}-${item.id}` : item.id,
      thumbnailFull: item.thumbnail
        ? item.thumbnail.startsWith('http')
          ? item.thumbnail
          : `${API_BASE}${item.thumbnail.startsWith('/') ? '' : '/'}${item.thumbnail}`
        : '/placeholder.png'
    }))
  } catch (e) {
    console.warn(`No se pudo cargar ${type} de ${source}:`, e)
    return []
  }
}