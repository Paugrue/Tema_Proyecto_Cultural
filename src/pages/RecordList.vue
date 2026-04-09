<template>
  <PageLayout>
    <!-- LOADING -->
    <v-row v-if="loading">
      <v-col v-for="i in 8" :key="i" cols="12" sm="6" md="4" lg="3">
        <v-skeleton-loader type="image, article" />
      </v-col>
    </v-row>

    <!-- LISTADO -->
    <v-row v-else>
      <v-col
        v-for="record in records"
        :key="record.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card
          class="record-card-wrapper"
          variant="flat"
          @click="goToRecord(record)"
        >

          <!-- IMAGE (FIXED) -->
          <v-img
            v-if="record.imageDisplay"
            :src="record.imageDisplay"
            height="250"
            cover
            class="rounded-lg mb-3"
          >
            <template v-slot:placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-progress-circular indeterminate />
              </v-row>
            </template>
          </v-img>

          <!-- FALLBACK (NO SPINNER) -->
          <div v-else class="image-fallback">
            <v-icon size="40" color="grey">
              mdi-image-off-outline
            </v-icon>
          </div>

          <div class="card-content">
            <div class="record-title">
              {{ record.displayTitle }}
            </div>

            <div v-if="record.cleanTags" class="record-meta">
              {{ record.cleanTags }}
            </div>
          </div>
        </v-card>
      </v-col>

      <!-- EMPTY -->
      <v-col v-if="records.length === 0" cols="12" class="text-center py-12">
        <v-icon size="64">mdi-database-search-outline</v-icon>
        <p class="mt-4">No se han encontrado resultados.</p>
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
import api from '@/services/api'
import PageLayout from '@/components/PageLayout.vue'

const route = useRoute()
const router = useRouter()

const records = ref([])
const loading = ref(false)

const page = ref(parseInt(route.query.page) || 1)

const limit = 6
const hasNextPage = ref(false)

const API_BASE = 'https://arcadium.cluster24.libnamic.eu'

/* =========================
   HELPERS
========================= */

function getCleanText(field) {
  if (!field) return ''
  if (typeof field === 'object') {
    const firstKey = Object.keys(field)[0]
    const content = field[firstKey] || field
    return content.value || content['@value'] || content[0]?.value || ''
  }
  if (typeof field === 'string' && field.startsWith('{')) return ''
  return field
}

function processRecord(item) {
  // ✅ FIX IMÁGENES (MISMO PATRÓN QUE COLECCIONES)
  let rawImg = item.preview || item.thumbnail || ''
  let img = ''

  if (rawImg && typeof rawImg === 'string') {
    if (rawImg.startsWith('http')) {
      img = rawImg
    } else {
      img = API_BASE + (rawImg.startsWith('/') ? '' : '/') + rawImg
    }
  }

  const titleField =
    item.metadata_fields?.['dcterms:title'] ||
    item.title ||
    item.name

  const displayTitle = getCleanText(titleField)

  let tags = item.joined_metadata || ''
  let cleanTags = ''

  if (Array.isArray(tags)) {
    cleanTags = tags
      .map(t => getCleanText(t))
      .filter(Boolean)
      .join(' • ')
  } else {
    const text = getCleanText(tags)
    cleanTags = text ? text.split(',').join(' • ') : ''
  }

  return {
    ...item,
    imageDisplay: img || null,
    displayTitle: displayTitle || 'Sin título',
    cleanTags
  }
}

/* =========================
   FETCH DATA
========================= */

async function fetchData() {
  loading.value = true

  // ✅ NUEVO: control de scope
  const scopes = (route.query.scope || 'records').split(',')

  try {
    let activeFilters = []

    if (route.query.rules) {
      activeFilters = JSON.parse(route.query.rules)
    }

    if (activeFilters.length > 0) {
      params.filters = activeFilters
    }
    const params = {
      with_labels: 1,
      fields: 'id,title,name,thumbnail,preview,description,joined_metadata,metadata_fields',

      limit: limit,
      offset: (page.value - 1) * limit,

      search: route.query.q?.trim() || '',
      combine: route.query.combine || 'AND',
    }

    const res = await api.getRecords(params)

    const items =
      res.data?.data ||
      res.data?.items ||
      []

    records.value = items.map(processRecord)

    hasNextPage.value = items.length === limit

  } catch (err) {
    records.value = []
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

watch(() => route.query, fetchData, { immediate: true })

watch(() => route.query.page, (p) => {
  page.value = parseInt(p) || 1
})

function goToRecord(record) {
  router.push(`/record/${record.id}`)
}
</script>

<style scoped>
.record-card-wrapper {
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  background-color: #E6C08E;
  border: 1px solid rgba(0,0,0,0.18);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.record-card-wrapper:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 26px rgba(0,0,0,0.08);
}

.card-content {
  padding: 16px;
}

.record-title {
  font-size: 18px;
  font-weight: 500;
}

.record-meta {
  font-size: 13px;
  opacity: 0.7;
}

/* NEW FALLBACK */
.image-fallback {
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #E6C08E;
  border-radius: 8px;
}

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