<template>
  <div>
    <!-- HERO / CABECERA -->
    <Hero />

    <!-- BARRA DE BÚSQUEDA -->
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

    <!-- CONTENIDO DE LA PÁGINA -->
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
  collections: { type: Array, default: () => [] } // Debe contener objetos {id, title}
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
        { title: 'Colección', value: 'collections' }
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
    sortDir: route.query.sortDir || 'asc'
  }
})


/* =========================
   BÚSQUEDA AVANZADA
========================= */
function onAdvancedSearch(payload) {
  const { scope, query, combine, rules } = payload

  function onAdvancedSearch(payload) {
  const { scope, query, combine, rules } = payload

  // ✅ Si el usuario está en /collection, ahí se queda
  const isCollectionPage = route.path.startsWith('/collection')
  const targetPath = isCollectionPage ? '/collection' : '/record'

  const queryParams = {
    q: query?.trim() || undefined,
    combine,
    rules: rules?.length ? JSON.stringify(rules) : undefined,
    scope, // seguimos pasando el scope
    page: 1
  }

  Object.keys(queryParams).forEach(key => {
    if (queryParams[key] == null) delete queryParams[key]
  })

  router.push({
    path: targetPath,
    query: queryParams
  })
}

  const queryParams = {
    q: query?.trim() || undefined,
    combine,
    rules: rules?.length ? JSON.stringify(rules) : undefined,
    scope,
    page: 1
  }

  // Limpieza de parámetros vacíos
  Object.keys(queryParams).forEach(key => {
    if (queryParams[key] == null) {
      delete queryParams[key]
    }
  })

  router.push({
    path: targetPath,
    query: queryParams
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

/* BLOQUE DE BÚSQUEDA */
.page-search-wrap {
  width: 100%;
  margin: 24px 0 32px;
}

/* CONTENEDOR INTERNO */
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