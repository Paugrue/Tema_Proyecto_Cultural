import { ref } from 'vue'

const FAVORITES_KEY = 'favorites'

const favorites = ref(JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'))

function save() {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.value))
}

export function useFavorites() {

  const isFavorite = (item) => {
    return favorites.value.some(f => f.id === item.id)
  }

const toggleFavorite = (item) => {

  const simplified = {
    id: item.id,
    title: item.displayTitle || item.title,
    image: item.imageDisplay || item.image || item.mediaItems?.[0]?.thumbnail || ''
  }

  const index = favorites.value.findIndex(f => f.id === simplified.id)

  if (index === -1) {
    favorites.value.push(simplified)
  } else {
    favorites.value.splice(index, 1)
  }

  save()
}

  return {
    favorites,
    isFavorite,
    toggleFavorite
  }
}