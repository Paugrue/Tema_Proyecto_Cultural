<template>
  <PageLayout>

    <!-- =========================
         RESULTADOS UNIFICADOS
    ========================== -->
    <v-row>

      <v-col
        v-for="item in combinedResults"
        :key="item._type + '-' + item.id"
        cols="12" sm="6" md="4"
      >
        <v-card @click="goToItem(item)">

          <v-img
            v-if="item.imageDisplay"
            :src="item.imageDisplay"
            height="200"
            cover
          />

          <v-card-title>
            {{ item._type === 'record'
                ? item.displayTitle
                : (item.title || 'Sin título')
            }}
          </v-card-title>

          <v-card-subtitle>
            {{ item._type === 'record' ? 'Registro' : 'Colección' }}
          </v-card-subtitle>

        </v-card>
      </v-col>

      <v-col v-if="combinedResults.length === 0" cols="12" class="text-center">
        No hay resultados
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
const collections = ref([])

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
  return field
}

/* RECORDS */
function processRecord(item) {
  let img = item.preview || item.thumbnail || item.image || ''

  if (img && typeof img === 'string' && !img.startsWith('http')) {
    img = API_BASE + (img.startsWith('/') ? '' : '/') + img
  }

  const title =
    getCleanText(item.metadata_fields?.['dcterms:title'])
    || item.title
    || item.name
    || 'Sin título'

  return {
    ...item,
    imageDisplay: img || null,
    displayTitle: title
  }
}

/* COLLECTIONS */
function processCollection(item) {
  let img = item.preview || item.thumbnail || item.image || ''

  if (img && typeof img === 'string' && !img.startsWith('http')) {
    img = API_BASE + (img.startsWith('/') ? '' : '/') + img
  }

  return {
    ...item,
    title: item.title || item.name || 'Sin título',
    imageDisplay: img || null
  }
}

/* =========================
   RESULTADOS UNIFICADOS
========================= */

const combinedResults = computed(() => {
  const scope = route.query.scope || 'records'

  let result = []

  if (scope === 'records') {
    result = records.value.map(r => ({ ...r, _type: 'record' }))
  }

  if (scope === 'collections') {
    result = collections.value.map(c => ({ ...c, _type: 'collection' }))
  }

  if (scope === 'all') {
    result = [
      ...records.value.map(r => ({ ...r, _type: 'record' })),
      ...collections.value.map(c => ({ ...c, _type: 'collection' }))
    ]
  }

  return result
})

/* =========================
   FETCH
========================= */

async function fetchRecords() {
  try {
    const res = await api.getRecords({
      search: route.query.q || '',
      combine: route.query.combine || 'AND'
    })

    const items = res.data?.data || res.data?.items || []
    records.value = items.map(processRecord)

  } catch {
    records.value = []
  }
}

async function fetchCollections() {
  try {
    const res = await api.getCollections({
      search: route.query.q || '',
      combine: route.query.combine || 'AND'
    })

    const items = res.data?.data || res.data?.items || []
    collections.value = items.map(processCollection)

  } catch {
    collections.value = []
  }
}

/* =========================
   CONTROL POR SCOPE
========================= */

function loadData() {
  const scope = route.query.scope || 'records'

  if (scope === 'records') {
    fetchRecords()
    collections.value = []
  }

  if (scope === 'collections') {
    fetchCollections()
    records.value = []
  }

  if (scope === 'all') {
    fetchRecords()
    fetchCollections()
  }
}

watch(() => route.query, loadData, { immediate: true })

/* =========================
   NAV
========================= */

function goToItem(item) {
  if (item._type === 'record') {
    router.push(`/record/${item.id}`)
  } else {
    router.push(`/collection/${item.id}`)
  }
}
</script>