<template>
  <div class="search-section">
    <div class="search-box">

      <v-text-field
        v-model="search"
        placeholder="Buscar registros, colecciones..."
        variant="outlined"
        density="comfortable"
        hide-details
        prepend-inner-icon="mdi-magnify"
        class="search-input"
        @keyup.enter="onBasicSearch"
      />

      <v-btn
        class="search-btn"
        color="primary"
        @click="onBasicSearch"
      >
        Buscar
      </v-btn>

      <v-btn
        variant="text"
        class="advanced-btn"
        color="primary"
        @click="advancedOpen = true"
      >
        Avanzada
      </v-btn>
    </div>

    <AdvancedSearchDialog
      v-model="advancedOpen"
      :fields="fields"
      :collections="collectionOptions"
      :defaults="defaults"
      @do-advanced-search="onAdvanced"
    />
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdvancedSearchDialog from './AdvancedSearchDialog.vue'

/* ─────────────────────────────────────────────
   Props y eventos (JS puro)
───────────────────────────────────────────── */

const props = defineProps({
  fields: { type: Array, default: () => [] },
  collections: { type: Array, default: () => [] },
  defaults: { type: Object, default: () => ({}) }
})

const emit = defineEmits([
  'doBasicSearch',
  'doAdvancedSearch'
])

const route = useRoute()
const router = useRouter()

const search = ref('')
const advancedOpen = ref(false)

/* ─────────────────────────────────────────────
   Normalización de colecciones
───────────────────────────────────────────── */

const collectionOptions = computed(() => {
  if (!props.collections.length) return []

  return props.collections
    .filter(c => c.id != null && (c.title || c.name))
    .map(c => ({
      id: c.id,
      title: c.title || c.name || 'Sin título'
    }))
})

/* ─────────────────────────────────────────────
   Sincronizar input con ?q de la URL
───────────────────────────────────────────── */

watch(
  () => route.query.q,
  val => {
    search.value = val || ''
  },
  { immediate: true }
)

/* ─────────────────────────────────────────────
   Búsqueda básica
───────────────────────────────────────────── */
function onBasicSearch() {
  const q = search.value.trim()
  if (!q) return

  router.push({
    path: '/search',
    query: {
      q,
      scope: 'all', 
      page: 1
    }
  })
}

/* ─────────────────────────────────────────────
   Búsqueda avanzada
───────────────────────────────────────────── */

function onAdvanced(payload) {
  const query = {
    q: payload.query?.trim() || undefined,
    scope: payload.scope,
    combine: payload.combine,
    page: 1
  }

  if (payload.rules?.length) {
    query.rules = JSON.stringify(payload.rules)
  }

  // Limpiar undefined / null
  Object.keys(query).forEach(k => {
    if (query[k] == null) delete query[k]
  })

  router.push({ path: '/search', query })
  advancedOpen.value = false
}
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
