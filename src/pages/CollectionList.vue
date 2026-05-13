<template>
  <PageLayout>
    <v-row>

      <!-- LOADING -->
      <v-col cols="12" v-if="loading">
        <v-row>
          <v-col v-for="i in 8" :key="i" cols="12" sm="6" md="4" lg="3">
            <v-skeleton-loader type="image, article" class="mb-4" />
          </v-col>
        </v-row>
      </v-col>

      <!-- LISTADO -->
      <v-col
        v-else
        v-for="col in collections"
        :key="col.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
<BaseCard
  :image="col.imageDisplay"
  :title="col.title"
  @click="$router.push('/collection/' + col.id)"
/>
      </v-col>

      <!-- EMPTY -->
      <v-col
        v-if="!loading && collections.length === 0"
        cols="12"
        class="text-center py-12"
      >
        <v-icon size="64" color="grey-lighten-2">
          mdi-database-off-outline
        </v-icon>

        <p class="text-grey-darken-1 mt-4 text-h6">
          No se han encontrado colecciones.
        </p>

        <v-btn
          variant="text"
          color="primary"
          class="mt-2"
          @click="$router.push('/collection')"
        >
          Ver todas las colecciones
        </v-btn>
      </v-col>

      <!-- PAGINACIÓN -->
      <v-col
        cols="12"
        class="d-flex justify-center mt-6"
        v-if="showPagination"
      >
        <div class="pagination-wrapper">

          <v-btn
            variant="outlined"
            :disabled="page === 1"
            @click="changePage(page - 1)"
          >
            ←
          </v-btn>

          <div class="page-number">
            {{ page }}
          </div>

          <v-btn
            variant="outlined"
            :disabled="!hasNextPage"
            @click="changePage(page + 1)"
          >
            →
          </v-btn>

        </div>
      </v-col>

    </v-row>
  </PageLayout>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageLayout from '@/components/PageLayout.vue'
import api from '@/services/api'
import BaseCard from '@/components/BaseCard.vue'

const route = useRoute()
const router = useRouter()

const collections = ref([])
const loading = ref(false)

const page = ref(parseInt(route.query.page) || 1)

const limit = 6
const hasNextPage = ref(false)

const API_BASE = 'https://arcadium.cluster24.libnamic.eu'

/* =========================
   HELPERS
========================= */

function processCollection(item) {
  let tags = []
  const rawMetadata = item.joined_metadata || item.metadata || ""

  if (Array.isArray(rawMetadata)) {
    tags = rawMetadata.map(t =>
      typeof t === 'object' ? (t.value || t['@value'] || '') : t
    )
  } else if (typeof rawMetadata === 'string' && rawMetadata.length > 0) {
    tags = rawMetadata.split(',').map(s => s.trim()).filter(Boolean)
  }

  let img = item.preview || item.thumbnail || item.image || '/placeholder.png'

  if (img !== '/placeholder.png' && !img.startsWith('http')) {
    img = `${API_BASE}${img.startsWith('/') ? '' : '/'}${img}`
  }

  return {
    ...item,
    id: item.id || Math.random(),
    imageDisplay: img,
    cleanTags: tags.filter(Boolean)
  }
}

/* =========================
   FETCH DATA
========================= */

async function fetchData() {
  loading.value = true

  const scopes = (route.query.scope || 'collections').split(',')

  try {
    let activeFilters = []

    if (route.query.rules) {
      try {
        activeFilters = JSON.parse(route.query.rules)
      } catch (e) {
        console.warn("Error parseando reglas:", e)
      }
    }

    const params = {
      with_labels: 1,
      fields: 'id,title,thumbnail,preview,description,joined_metadata',

      limit: limit,
      offset: (page.value - 1) * limit,

      search: route.query.q?.trim() || '',
      combine: route.query.combine || 'AND',
    }

    if (activeFilters.length > 0) {
      params.filters = activeFilters
    }

    if (route.query.sortBy) params.sort = route.query.sortBy
    if (route.query.sortDir) params.direction = route.query.sortDir

    const response = await api.getCollections(params)

    const apiData =
      response.data?.data ||
      response.data?.items ||
      (Array.isArray(response.data) ? response.data : [])

    collections.value = apiData.map(processCollection)

    hasNextPage.value = apiData.length === limit

  } catch (error) {
    console.error("Error en fetchData collections:", error)
    collections.value = []
    hasNextPage.value = false
  } finally {
    loading.value = false
  }
}

/* =========================
   PAGINACIÓN
========================= */

function changePage(newPage) {
  if (newPage < 1) return
  if (newPage > page.value && !hasNextPage.value) return

  page.value = newPage

  router.push({
    query: {
      ...route.query,
      page: newPage
    }
  })

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const showPagination = computed(() => {
  return page.value > 1 || hasNextPage.value
})

/* =========================
   WATCHERS
========================= */

watch(() => route.query, fetchData, { immediate: true, deep: true })

watch(() => route.query.page, (p) => {
  page.value = parseInt(p) || 1
})
</script>

<style scoped>
.collection-card {
  transition: all 0.25s ease;
  cursor: pointer;
}

.collection-card:hover {
  transform: translateY(-4px);
}

/* =========================
   LOADING
========================= */

.image-loading {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* =========================
   TEXTO CARD
========================= */

.card-title {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 8px;
}

.card-subtitle {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: rgb(var(--v-theme-primary));
  margin-bottom: 8px;
}

.card-description {
  font-size: 0.92rem;
  color: rgba(0,0,0,0.7);

  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* =========================
   PAGINACIÓN 
========================= */
/* PAGINACIÓN */
.pagination-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.page-number {
  min-width: 40px;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
}
</style>