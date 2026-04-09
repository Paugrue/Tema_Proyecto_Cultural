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
        <v-card
          class="record-card"
          @click="$router.push('/collection/' + col.id)"
        >
          <v-hover v-slot="{ isHovering, props }">

            <!-- IMAGEN (FIX REAL) -->
            <v-img
              v-bind="props"
              :src="col.imageDisplay"
              height="280"
              cover
              class="rounded-lg position-relative"
              @error="col.imageDisplay = null"
              v-if="col.imageDisplay"
            >
              <v-fade-transition>
                <div
                  v-if="isHovering"
                  class="d-flex transition-fast-in-fast-out v-card--reveal"
                  style="height: 100%; background: rgba(0,0,0,0.15);"
                ></div>
              </v-fade-transition>

              <template v-slot:placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular indeterminate color="grey-lighten-2" />
                </v-row>
              </template>
            </v-img>

            <!-- FALLBACK SI FALLA IMAGEN -->
            <template v-else>
              <div class="image-placeholder rounded-lg">
                <v-icon size="40" color="grey-lighten-1">
                  mdi-image-off-outline
                </v-icon>
              </div>
            </template>

          </v-hover>

          <v-card-item class="px-0 pt-4">
            <v-card-title class="text-h6 font-weight-bold pb-1">
              {{ col.title || 'Colección sin título' }}
            </v-card-title>

            <v-card-subtitle
              v-if="col.cleanTags && col.cleanTags.length"
              class="text-caption text-uppercase font-weight-medium text-primary"
            >
              {{ col.cleanTags.join(' • ') }}
            </v-card-subtitle>
          </v-card-item>

          <v-card-text class="px-0 pt-0 text-body-2 text-grey-darken-1">
            <p class="line-clamp-2">
              {{ col.description || 'Explora esta colección cultural.' }}
            </p>
          </v-card-text>
        </v-card>
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
        class="d-flex justify-center align-center mt-6"
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

.image-placeholder {
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;

  /* 🔥 usa el color real de la card */
  background:  #E6C08E;

  /* opcional: más integración visual */
  color: rgb(var(--v-theme-on-surface));
}
</style>