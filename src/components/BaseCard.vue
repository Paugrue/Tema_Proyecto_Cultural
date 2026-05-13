<template>
  <v-card
    class="base-card"
    variant="flat"
    @click="$emit('click')"
  >
    <!-- IMAGEN / FALLBACK (UNIFICADO) -->
    <div class="image-wrapper">
      <v-img
        v-if="safeImage"
        :src="safeImage"
        height="220"
        cover
        class="card-image"
        @error="handleImageError"
      >
        <template #placeholder>
          <div class="image-loading">
            <v-progress-circular indeterminate />
          </div>
        </template>
      </v-img>

      <div v-else class="image-fallback">
        <v-icon size="42" color="grey-lighten-1">
          mdi-image-off-outline
        </v-icon>
      </div>
    </div>

    <!-- CONTENIDO -->
    <div class="card-content">
      <div class="card-title">
        {{ title }}
      </div>

      <div
        v-if="subtitle"
        class="card-subtitle"
      >
        {{ subtitle }}
      </div>

      <div
        v-if="description"
        class="card-description"
      >
        {{ description }}
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  image: String,
  title: String,
  subtitle: String,
  description: String
})

const safeImage = ref(props.image)

watch(
  () => props.image,
  (val) => {
    safeImage.value = val
  }
)

function handleImageError() {
  safeImage.value = null
}
</script>

<style scoped>
.base-card {
  width: 100%;
  height: 310px;

  display: flex;
  flex-direction: column;

  overflow: hidden;

  border-radius: 22px;
  background: #dec08d;

  cursor: pointer;

  transition: transform 0.25s ease, box-shadow 0.25s ease;

  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}

.base-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.12);
}

/* =========================
   IMAGEN / FALLBACK
========================= */

.image-wrapper {
  height: 220px;
  width: 100%;
  flex-shrink: 0;

  position: relative;
  overflow: hidden;

  border-radius: 22px 22px 0 0;
}

.card-image {
  height: 220px;
  width: 100%;
}

.image-fallback {
  height: 220px;
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #dec08d;

  position: absolute;
  inset: 0;
}

.image-loading {
  height: 220px;
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #f5f5f5;
}

/* =========================
   CONTENIDO
========================= */

.card-content {
  flex: 1;

  padding: 12px 16px 14px; /* 👈 reducido */

  display: flex;
  flex-direction: column;

  overflow: hidden;
}

/* 🔥 TÍTULO MÁS PEQUEÑO */
.card-title {
  font-size: 1.4rem; /* antes 1.9rem */
  font-weight: 700;
  line-height: 1.15;
  color: #111;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* SUBTÍTULO MÁS COMPACTO */
.card-subtitle {
  margin-top: 4px;

  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;

  color: rgba(0,0,0,0.55);

  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* DESCRIPCIÓN MÁS COMPACTA */
.card-description {
  margin-top: 6px;

  font-size: 0.9rem;
  color: rgba(0,0,0,0.72);

  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>