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

    <!-- ✅ FIX GLOBAL LAYOUT -->
    <main class="page-container">
      <div class="page-content">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Hero from '@/components/Hero.vue'
import SearchBar from '@/components/SearchBar.vue'

const props = defineProps({
  fields: { type: Array, default: () => [] },
  collections: { type: Array, default: () => [] }
})

const router = useRouter()
const route = useRoute()

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

const collectionsList = computed(() =>
  Array.isArray(props.collections)
    ? props.collections.map(c => ({
        id: c.id,
        title: c.title || c.name || 'Sin título'
      }))
    : []
)

const advancedDefaults = computed(() => {
  let rules = []

  try {
    if (route.query.rules) {
      rules = JSON.parse(route.query.rules)
    }
  } catch {
    rules = []
  }

  return {
    scope: route.query.scope || 'records',
    query: route.query.q || '',
    combine: route.query.combine || 'AND',
    rules,
    sortBy: route.query.sortBy || 'default',
    sortDir: route.query.sortDir || 'asc'
  }
})

/* =========================
   SEARCH SIMPLE
========================= */
const onBasicSearch = (query) => {
  router.push({
    path: '/record',
    query: {
      q: query || undefined,
      page: 1
    }
  })
}

/* =========================
   SEARCH AVANZADO
========================= */
const onAdvancedSearch = (payload) => {
  const { scope, query, combine, rules } = payload

  const isCollectionPage = route.path.startsWith('/collection')
  const targetPath = isCollectionPage ? '/collection' : '/record'

  const queryParams = {
    q: query?.trim() || undefined,
    combine,
    rules: rules?.length ? JSON.stringify(rules) : undefined,
    scope,
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
</script>

<style scoped>
/* =========================
   GLOBAL LAYOUT FIX
========================= */

.page-container {
  width: 100%;
}

/* 🔥 CLAVE: este es el contenedor que arregla todo */
.page-content {
  max-width: 1200px;
  margin: 0 auto;

  /* Aire lateral global */
  padding-left: 24px;
  padding-right: 24px;

  /* Aire vertical opcional */
  padding-top: 16px;
  padding-bottom: 16px;
}

/* =========================
   SEARCH WRAPPER (sin cambios funcionales)
========================= */

.page-search-wrap {
  width: 100%;
}

.page-search-inner {
  width: 100%;
}
</style>