<template>
  <div class="search-section">
    <div class="search-box">
      <v-text-field
        v-model="search"
        placeholder="Buscar registros..."
        variant="outlined"
        density="comfortable"
        hide-details
        prepend-inner-icon="mdi-magnify"
        class="search-input"
        @keydown.enter.prevent="onBasicSearch"
      />

      <v-btn class="search-btn" @click="onBasicSearch">
        Buscar
      </v-btn>

      <v-btn variant="text" class="advanced-btn" @click="advancedOpen = true">
        Avanzada
      </v-btn>
    </div>

    <AdvancedSearchDialog
      v-model="advancedOpen"
      :fields="fields"
      :collections="collectionsForDialog"
      :defaults="defaults"
      @do-advanced-search="onAdvanced"
    />
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import AdvancedSearchDialog from './AdvancedSearchDialog.vue'

const props = defineProps({
  fields: { type: Array, default: () => [] },
  defaults: Object,
  collections: { type: Array, default: () => [] } // lista de colecciones {id, title}
})

const emit = defineEmits(['do-basic-search', 'do-advanced-search'])

const route = useRoute()
const search = ref('')
const advancedOpen = ref(false)

// sincroniza input con query param
watch(
  () => route.query.q,
  val => {
    search.value = val || ''
  },
  { immediate: true }
)

// envía búsqueda básica
function onBasicSearch() {
  emit('do-basic-search', search.value)
}

// envía búsqueda avanzada
function onAdvanced(payload) {
  emit('do-advanced-search', payload)
  advancedOpen.value = false
}

// --- CORRECCIÓN IMPORTANTE ---
// convertimos las colecciones para que el dialogo reciba {id, title} siempre
const collectionsForDialog = computed(() =>
  props.collections.map(c => ({
    id: c.id,
    title: c.title || c.name || 'Sin título'
  }))
)
</script>

<style scoped>
/* =========================================================
   SECCIÓN DE BÚSQUEDA (EDITORIAL)
   ========================================================= */

.search-section {
  display: flex;
  justify-content: center;
  margin: 40px 0 56px;
  padding: 0 16px;
}

/* =========================================================
   CAJA DE BÚSQUEDA
   ========================================================= */

.search-box {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 12px;
  width: 100%;
  max-width: 880px;
}

/* =========================================================
   INPUT DE BÚSQUEDA (ARCHIVO / CATÁLOGO)
   ========================================================= */

.search-input :deep(.v-field) {
  border-radius: 8px !important; /* ❌ no pastilla */
  background: var(--color-background-soft);
  height: 52px;
  border: 1px solid var(--color-border);
  font-family: var(--font-serif);
}

/* =========================================================
   BOTÓN BUSCAR (EDITORIAL)
   ========================================================= */

.search-btn {
  border-radius: 8px !important;
  height: 52px !important;

  background: var(--color-primary) !important;
  color: #ffffff !important;

  font-family: var(--font-sans);
  font-weight: 500;
  padding: 0 24px;
  transition: background-color 0.25s ease, transform 0.25s ease;
}

.search-btn:hover {
  background: var(--color-primary-hover) !important;
  transform: translateY(-1px);
}

/* =========================================================
   BOTÓN BÚSQUEDA AVANZADA (SECUNDARIO)
   ========================================================= */

.advanced-btn {
  height: 52px !important;

  background: transparent !important;
  border: 1px solid var(--color-primary) !important;
  color: var(--color-primary) !important;

  border-radius: 8px !important;
  font-family: var(--font-sans);
  font-weight: 500;
  padding: 0 20px;
}

.advanced-btn:hover {
  background: rgba(107, 47, 58, 0.06) !important;
}

/* =========================================================
   RESPONSIVE
   ========================================================= */

@media (max-width: 768px) {
  .search-box {
    grid-template-columns: 1fr;
  }

  .search-btn,
  .advanced-btn {
    width: 100%;
  }
}
</style>
