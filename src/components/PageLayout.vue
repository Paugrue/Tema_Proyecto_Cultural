<template>
  <div>
    <Hero />

    <section class="page-search-wrap">
      <div class="page-search-inner">
        <SearchBar
          :fields="fieldsList"
          :collections="collectionsList"
          :defaults="advancedDefaults"
          @do-basic-search="onBasicSearch"
          @do-advanced-search="onAdvancedSearch"
        />
      </div>
    </section>

    <main class="page-container">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Hero from '@/components/Hero.vue'
import SearchBar from '@/components/SearchBar.vue'

/* PROPS */
const props = defineProps({
  fields: { type: Array, default: () => [] },
  collections: { type: Array, default: () => [] }, // Debe contener objetos {id, title}
})

const router = useRouter()
const route = useRoute()

/* CAMPOS DISPONIBLES PARA BÚSQUEDA */
const fieldsList = computed(() =>
  props.fields.length
    ? props.fields
    : [
        { title: 'Título', value: 'title' },
        { title: 'Autor', value: 'author' },
        { title: 'Fecha', value: 'date' },
        { title: 'Descripción', value: 'description' },
        { title: 'Colección', value: 'collections' } // necesario para AdvancedSearchDialog
      ]
)

/* COLECCIONES DISPONIBLES */
const collectionsList = computed(() =>
  Array.isArray(props.collections)
    ? props.collections.map(c => ({ id: c.id, title: c.title || c.name || 'Sin título' }))
    : []
)

/* SINCRONIZAR URL → ESTADO DEL BUSCADOR */
const advancedDefaults = computed(() => {
  let rules = []

  try {
    if (route.query.rules) {
      rules = JSON.parse(route.query.rules)
    }
  } catch (e) {
    rules = []
  }

  return {
    scope: route.query.scope || 'records',
    query: route.query.q || '',
    combine: route.query.combine || 'AND',
    rules: rules,
    sortBy: route.query.sortBy || 'default',
    sortDir: route.query.sortDir || 'asc',
  }
})

/* BÚSQUEDA BÁSICA */
function onBasicSearch(q) {
  const queryTerm = q?.trim() || undefined

  router.push({
    path: '/record',
    query: {
      q: queryTerm,
      page: 1
    }
  })
}

/* BÚSQUEDA AVANZADA */
function onAdvancedSearch(payload) {
  const goTo =
    payload.scope === 'collections'
      ? '/collection'
      : '/record'

  const query = {
    q: payload.query?.trim() || undefined,
    scope: payload.scope,
    combine: payload.combine,
    rules: payload.rules?.length
      ? JSON.stringify(payload.rules)
      : undefined,
    sortBy: payload.sortBy || undefined,
    sortDir: payload.sortDir || undefined,
    page: 1,
  }

  // Limpieza automática de undefined
  Object.keys(query).forEach(key => {
    if (query[key] === undefined) delete query[key]
  })

  router.push({
    path: goTo,
    query
  })
}
</script>

<style scoped>
/* CONTENEDOR PRINCIPAL DE PÁGINA */

.page-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px;
}

/* BLOQUE DE BÚSQUEDA DE PÁGINA */
/* Separación clara respecto a headers y contenido */

.page-search-wrap {
  width: 100%;
  margin: 24px 0 32px;
}

/* CONTENEDOR INTERNO (ANCHURA AMPLIA CONTROLADA) */

.page-search-inner {
  max-width: 1400px;
  margin: 0 auto;
}

/* RESPONSIVE */

@media (max-width: 768px) {
  .page-container {
    padding: 24px 20px;
  }

  .page-search-wrap {
    margin: 16px 0 24px;
  }
}
</style>