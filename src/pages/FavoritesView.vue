<script setup>
import { ref } from 'vue'
import { useFavorites } from '@/composables/useFavorites'
import { useRouter } from 'vue-router'

const { favorites, toggleFavorite } = useFavorites()
const router = useRouter()

const goToRecord = (id) => {
  router.push(`/record/${id}`)
}

// carrusel ref
const carouselRef = ref(null)

// scroll dinámico con ratón
const handleMouseMove = (e) => {
  const el = carouselRef.value
  if (!el) return

  const rect = el.getBoundingClientRect()
  const x = e.clientX - rect.left
  const width = rect.width

  const edgeSize = 120 // zona lateral sensible

  // izquierda
  if (x < edgeSize) {
    el.scrollBy({ left: -15, behavior: 'auto' })
  }

  // derecha
  if (x > width - edgeSize) {
    el.scrollBy({ left: 15, behavior: 'auto' })
  }
}
</script>

<template>
  <div class="favorites-background">

    <v-sheet class="favorites-window pa-6" elevation="10" rounded="lg">

      <!-- VACÍO -->
      <div v-if="favorites.length === 0" class="text-center py-10">
        <v-icon size="80" color="grey">
          mdi-image-off-outline
        </v-icon>
        <p class="text-grey mt-2">
          No hay piezas en la exposición
        </p>
      </div>

      <!-- GRID -->
      <v-row v-else-if="favorites.length <= 3" dense>
        <v-col
          v-for="item in favorites"
          :key="item.id"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card class="expo-card" hover>

            <v-btn
              icon
              class="favorite-btn"
              @click.stop="toggleFavorite(item)"
            >
              <v-icon color="red">mdi-heart</v-icon>
            </v-btn>

            <div @click="goToRecord(item.id)">
              <v-img
                :src="item.image"
                height="240"
                cover
                class="expo-image"
              />

              <div class="expo-overlay">
                <span class="expo-title">
                  {{ item.title }}
                </span>
              </div>
            </div>

          </v-card>
        </v-col>
      </v-row>

      <!-- CARRUSEL -->
      <div
        v-else
        ref="carouselRef"
        class="favorites-carousel"
        @mousemove="handleMouseMove"
      >

        <div
          v-for="item in favorites"
          :key="item.id"
          class="carousel-item"
        >
          <v-card class="expo-card">

            <!-- ❤️ quitar -->
            <v-btn
              icon
              class="favorite-btn"
              @click.stop="toggleFavorite(item)"
            >
              <v-icon color="red">mdi-heart</v-icon>
            </v-btn>

            <div @click="goToRecord(item.id)">

              <v-img
                :src="item.image"
                height="260"
                cover
                class="expo-image"
              />

              <div class="expo-overlay">
                <span class="expo-title">
                  {{ item.title }}
                </span>
              </div>

            </div>

          </v-card>
        </div>

      </div>

    </v-sheet>

  </div>
</template>

<style scoped>
/* FONDO */
.favorites-background {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--color-background);
  padding: 20px;
}

/* CONTENEDOR */
.favorites-window {
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  background: linear-gradient(145deg, #f6b26b, #e67e22);
  border-radius: 16px;
}

/* TARJETAS */
.expo-card {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.expo-card:hover {
  transform: scale(1.03);
}

.expo-image {
  transition: transform 0.4s ease;
}

.expo-card:hover .expo-image {
  transform: scale(1.08);
}

/* BOTÓN */
.favorite-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 5;
  background: rgba(0,0,0,0.6);
}

/* TEXTO */
.expo-overlay {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 12px;
  background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
}

.expo-title {
  color: white;
  font-weight: 600;
  font-size: 14px;
  display: -webkit-box;

  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* CARRUSEL */
.favorites-carousel {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 20px;
  scroll-behavior: auto;
}

/* ocultar scrollbar */
.favorites-carousel::-webkit-scrollbar {
  display: none;
}

/* ITEM */
.carousel-item {
  flex: 0 0 auto;
  width: 260px;
  transition: transform 0.3s ease;
}

/* HOVER DESTACADO */
.carousel-item:hover {
  transform: scale(1.15);
  z-index: 3;
}

.carousel-item:hover .expo-card {
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
}
</style>