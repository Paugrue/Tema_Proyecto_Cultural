<script setup>
import { useFavorites } from '@/composables/useFavorites'
import { useRouter } from 'vue-router'

const { favorites } = useFavorites()
const router = useRouter()

// 👉 navegación a detalle
const goToRecord = (id) => {
  router.push(`/record/${id}`)
}
</script>

<template>
  <div class="favorites-background">

    <v-sheet class="favorites-window pa-6" elevation="10" rounded="lg">

      <!-- =========================
           VACÍO
      ========================== -->
      <div v-if="favorites.length === 0" class="text-center py-10">
        <v-icon size="80" color="grey">
          mdi-image-off-outline
        </v-icon>
        <p class="text-grey mt-2">
          No hay piezas en la exposición
        </p>
      </div>

      <!-- =========================
           GRID (1–3 ELEMENTOS)
      ========================== -->
      <v-row v-else-if="favorites.length <= 3" dense>

        <v-col
          v-for="item in favorites"
          :key="item.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >

          <v-card
            class="expo-card"
            hover
            @click="goToRecord(item.id)"
          >

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

          </v-card>

        </v-col>

      </v-row>

      <!-- =========================
           CARRUSEL (> 3 ELEMENTOS)
      ========================== -->
      <div v-else class="favorites-carousel">

        <div
          v-for="item in favorites"
          :key="item.id"
          class="carousel-item"
        >

          <v-card
            class="expo-card"
            hover
            @click="goToRecord(item.id)"
          >

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

          </v-card>

        </div>

      </div>

    </v-sheet>

  </div>
</template>

<style scoped>
/* =========================
   FONDO GENERAL
========================= */
.favorites-background {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--color-background);
  padding: 20px;
}

/* =========================
   CONTENEDOR
========================= */
.favorites-window {
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  background: linear-gradient(
  145deg,
  #f6b26b,
  #e67e22
);
  border-radius: 16px;
}

/* =========================
   TARJETAS EXPOSICIÓN
========================= */
.expo-card {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.expo-card:hover {
  transform: scale(1.04);
}

.expo-image {
  transition: transform 0.4s ease;
}

.expo-card:hover .expo-image {
  transform: scale(1.03);
}

/* =========================
   TEXTO SOBRE IMAGEN
========================= */
.expo-overlay {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 12px;

  background: linear-gradient(
    to top,
    rgba(0,0,0,0.6),
    transparent
  );
}

.expo-title {
  color: white;
  font-weight: 600;
  font-size: 14px;

  display: -webkit-box;
  -webkit-line-clamp: 2;   /* máximo 2 líneas */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* =========================
   CARRUSEL HORIZONTAL
========================= */
.favorites-carousel {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 10px;

  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.carousel-item {
  flex: 0 0 auto;
  width: 280px;
  scroll-snap-align: start;
}

/* SCROLLBAR */
.favorites-carousel::-webkit-scrollbar {
  height: 6px;
}

.favorites-carousel::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.2);
  border-radius: 10px;
}


</style>