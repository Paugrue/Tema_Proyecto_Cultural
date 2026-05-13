<template>
  <!-- GALERÍA -->
  <div class="media-grid">
    <div
      v-for="(m, i) in items"
      :key="m.id || i"
      class="media-thumb"
      @click="open(i)"
    >
      <img
        v-if="m.type === 'image'"
        :src="m.thumbnail || m.full"
      />

      <div v-else class="media-fallback">
        <v-icon>mdi-file</v-icon>
      </div>
    </div>
  </div>

  <!-- VIEWER -->
  <v-dialog v-model="dialog" fullscreen>

    <v-card class="bg-black">

      <!-- CLOSE -->
      <v-toolbar flat color="transparent">
        <v-spacer />
        <v-btn icon="mdi-close" color="white" @click="dialog = false" />
      </v-toolbar>

      <!-- NAV -->
      <v-btn
        icon="mdi-chevron-left"
        class="nav left"
        color="white"
        @click="prev"
      />

      <v-btn
        icon="mdi-chevron-right"
        class="nav right"
        color="white"
        @click="next"
      />

      <!-- CONTENT -->
      <div class="viewer-content">

        <img
          v-if="current?.type === 'image'"
          :src="current.full"
        />

        <video
          v-else-if="current?.type === 'video'"
          controls
          :src="current.full"
        />

        <iframe
          v-else-if="current?.type === 'pdf'"
          :src="current.full"
        />

        <div v-else>
          Archivo no soportado
        </div>

      </div>

    </v-card>

  </v-dialog>
</template>

<script setup>
import { ref, computed } from "vue"

const props = defineProps({
  items: { type: Array, default: () => [] }
})

const dialog = ref(false)
const index = ref(0)

const current = computed(() => props.items[index.value])

const open = (i) => {
  index.value = i
  dialog.value = true
}

const next = () => {
  index.value = (index.value + 1) % props.items.length
}

const prev = () => {
  index.value =
    index.value === 0
      ? props.items.length - 1
      : index.value - 1
}
</script>

<style scoped>
.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.media-thumb {
  cursor: pointer;
  height: 120px;
  background: #eee;
  overflow: hidden;
  border-radius: 8px;
}

.media-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.viewer-content {
  height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.viewer-content img,
.viewer-content video,
.viewer-content iframe {
  max-width: 90%;
  max-height: 90vh;
}

.nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.nav.left { left: 10px; }
.nav.right { right: 10px; }
</style>
