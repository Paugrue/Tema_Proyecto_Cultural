<template>
  <PageLayout @basic-search="onBasicSearch">

    <v-btn 
      :to="{ path: '/record', query: route.query }" 
      variant="text" 
      prepend-icon="mdi-arrow-left" 
      class="mb-4"
    >
      Volver al listado
    </v-btn>

    <!-- LOADING -->
    <v-row v-if="loading">
      <v-col cols="12" class="text-center py-12">
        <v-progress-circular indeterminate color="primary" size="64" />
      </v-col>
    </v-row>

    <!-- CONTENT -->
    <v-row v-else>

      <!-- MEDIA PRINCIPAL -->
      <v-col cols="12" md="6">

        <div
          class="d-flex align-center justify-center cursor-pointer"
          style="height:550px;"
          @click="openMainViewer"
        >
          <v-img
            v-if="mainMedia && mainMedia.thumbnail"
            :src="imageSize(mainMedia.thumbnail, 'large')"
            max-height="100%"
            max-width="100%"
            contain
          />

          <div
            v-else
            class="d-flex align-center justify-center fill-height"
          >
            <v-icon size="128">mdi-file-image-outline</v-icon>
          </div>
        </div>

      </v-col>

      <!-- INFO -->
      <v-col cols="12" md="6">
        <div class="pa-md-6">

          <!-- TITULO + FAVORITO -->
          <div class="d-flex align-center justify-space-between mb-2">
            <h1 class="text-h3 font-weight-bold">
              {{ record.displayTitle }}
            </h1>

            <!-- ⭐ BOTÓN FAVORITO -->
            <v-btn
  icon
  variant="text"
  @click="toggleFavorite(record)"
>
  <v-icon
    :color="isFavorite(record) ? 'red' : 'success'"
    size="32"
  >
    {{ isFavorite(record) ? 'mdi-heart' : 'mdi-heart-outline' }}
  </v-icon>
</v-btn>
          </div>

          <div v-if="record.cleanCollections" class="text-overline text-primary mb-6">
            {{ record.cleanCollections }}
          </div>

          <v-divider class="mb-6" />

          <div class="metadata-block mb-10">
            <h2 class="metadata-header">Información básica</h2>
            <MetadataViewer :metadata="record.canonicalMetadata" />
          </div>

          <v-tabs v-model="tab" color="primary" class="mt-8">
            <v-tab value="all">Ficha Completa</v-tab>
            <v-tab value="media">
              Media ({{ record.mediaItems?.length || 0 }})
            </v-tab>
          </v-tabs>

          <v-window v-model="tab" class="mt-6">
            <v-window-item value="all">
              <MetadataViewer :metadata="record.joinedMetadata" />
            </v-window-item>

            <v-window-item value="media">
              <MediaGallery :items="record.mediaItems" />
            </v-window-item>
          </v-window>

        </div>
      </v-col>

    </v-row>

    <!-- RELACIONADOS -->
    <v-divider class="my-12" />

    <div v-if="relatedRecords.length">
      <h2 class="text-h5 font-weight-bold mb-6">
        También te puede interesar
      </h2>

      <v-row>
        <v-col
          v-for="r in relatedRecords"
          :key="r.id"
          cols="12"
          sm="6"
          md="3"
        >
          <v-card
            flat
            class="related-card pa-4 d-flex flex-column ga-3 h-100"
            @click="navigateToRecord(r.id)"
          >
            <v-img
              :src="imageSize(r.imageDisplay, 'medium')"
              height="200"
              cover
              class="rounded-lg bg-grey-lighten-2"
            />

            <div class="related-title font-weight-bold">
              {{ r.displayTitle }}
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- VIEWER -->
    <v-dialog
      v-model="mainViewer"
      fullscreen
      transition="dialog-bottom-transition"
    >
      <v-card class="bg-black">

        <v-toolbar flat color="transparent">
          <v-spacer />
          <v-btn icon="mdi-close" color="white" @click="mainViewer = false" />
        </v-toolbar>

        <v-btn
          icon="mdi-chevron-left"
          class="position-absolute"
          style="left:10px; top:50%; z-index:10;"
          color="white"
          @click="prevMedia"
        />

        <v-btn
          icon="mdi-chevron-right"
          class="position-absolute"
          style="right:10px; top:50%; z-index:10;"
          color="white"
          @click="nextMedia"
        />

        <v-row no-gutters align="center" justify="center" class="fill-height">
          <v-col cols="12" class="d-flex justify-center align-center">

            <v-img
              v-if="mediaList[currentIndex] && !mediaList[currentIndex].isPdf"
              :src="mediaList[currentIndex].full"
              max-height="90vh"
              contain
            />

            <iframe
              v-else-if="mediaList[currentIndex] && mediaList[currentIndex].isPdf"
              :src="mediaList[currentIndex].full"
              style="width:100%; height:90vh; border:none;"
            />

          </v-col>
        </v-row>

      </v-card>
    </v-dialog>

  </PageLayout>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from "vue"
import { useRoute, useRouter } from "vue-router"

import PageLayout from "@/components/PageLayout.vue"
import MetadataViewer from "@/components/MetadataViewer.vue"
import MediaGallery from "@/components/MediaGallery.vue"

import api from "@/services/api"
import { normalizeRecord } from "@/utils/normalizeRecord"
import { imageSize } from "@/utils/imageSize"

import { useFavorites } from '@/composables/useFavorites'

const { isFavorite, toggleFavorite } = useFavorites()

// =========================
// ROUTER
// =========================
const route = useRoute()
const router = useRouter()

// =========================
// STATE
// =========================
const record = ref({})
const relatedRecords = ref([])
const loading = ref(true)
const tab = ref("all")

// =========================
// MEDIA
// =========================
const mainMedia = computed(() => {
  const media = record.value.mediaItems || []
  return media.find(m => !m.isPdf) || media[0] || null
})

const mediaList = computed(() => record.value.mediaItems || [])
const currentIndex = ref(0)
const mainViewer = ref(false)

// =========================
// LOAD
// =========================
const loadData = async () => {
  loading.value = true
  try {
    // =========================
    // RECORD PRINCIPAL
    // =========================
    const res = await api.getRecord(route.params.id)
    const recData = res.data?.data || res.data || {}
    
    record.value = normalizeRecord(recData)

    // =========================
    // RELACIONADOS
    // =========================
    relatedRecords.value = await loadRelated(recData)

    const collections = recData.collections_titles

    if (collections) {
      const firstCollection = collections.split(",")[0].trim()


      try {
        const relatedRes = await api.searchRecords({
          collection_title: firstCollection,
          limit: 5,
          with_thumbnails: 1
        })


        relatedRecords.value = (relatedRes.data?.items || [])
          .map(normalizeRecord)
          .filter(r => r.id !== record.value.id)

      } catch (err) {
        console.error("RELATED ERROR:", err)
      }
    }

  } catch (e) {
    console.error("RecordDetail error:", e)
  } finally {
    loading.value = false
  }
}

const loadRelated = async (recData) => {
  const collections = recData.collections_titles

  let items = []

  try {
    // =========================
    // 1. BÚSQUEDA PRINCIPAL
    // =========================
    if (collections) {
      const firstCollection = collections.split(",")[0].trim()

      const res = await api.searchRecords({
        collection_title: firstCollection,
        limit: 8
      })

      items = res.data?.items || []
    }

    // quitar el actual
    items = items.filter(r => r.id !== recData.id)

    // =========================
    // 2. FALLBACK GLOBAL (SI NO HAY SUFICIENTES)
    // =========================
    if (items.length < 4) {
      const fallbackRes = await api.searchRecords({
        limit: 8
      })

      const fallbackItems = (fallbackRes.data?.items || [])
        .filter(r => r.id !== recData.id)

      // combinar sin duplicados
      const map = new Map()

      ;[...items, ...fallbackItems].forEach(r => {
        map.set(r.id, r)
      })

      items = Array.from(map.values())
    }

    return items.slice(0, 4).map(normalizeRecord)

  } catch (e) {
    console.error("RELATED ERROR:", e)

    // =========================
    // FALLBACK FINAL ABSOLUTO
    // =========================
    try {
      const fallbackRes = await api.searchRecords({ limit: 8 })

      return (fallbackRes.data?.items || [])
        .filter(r => r.id !== recData.id)
        .slice(0, 4)
        .map(normalizeRecord)

    } catch (err) {
      console.error("FALLBACK FINAL ERROR:", err)
      return []
    }
  }
}
// =========================
// VIEWER
// =========================
const openMainViewer = () => {
  currentIndex.value = mediaList.value.findIndex(
    m => m.id === mainMedia.value?.id
  )

  if (currentIndex.value < 0) currentIndex.value = 0
  mainViewer.value = true
}

const nextMedia = () => {
  currentIndex.value =
    currentIndex.value < mediaList.value.length - 1
      ? currentIndex.value + 1
      : 0
}

const prevMedia = () => {
  currentIndex.value =
    currentIndex.value > 0
      ? currentIndex.value - 1
      : mediaList.value.length - 1
}

// =========================
// NAV
// =========================
const navigateToRecord = (id) => {
  router.push(`/record/${id}`)
}

const onBasicSearch = (query) => {
  router.push({ path: "/record", query: { q: query } })
}

// =========================
// INIT
// =========================
onMounted(loadData)
watch(() => route.params.id, loadData)
</script>

<style scoped>
.metadata-block {
  margin-top: 24px;
}

.metadata-header {
  font-family: var(--font-serif, serif);
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1a1a1a;
}

/* RELACIONADOS */
.related-card {
  background-color: #E6C08E !important;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.related-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
}

.related-title {
  font-size: 0.95rem;
  color: #4a3319;
  line-height: 1.3;
}

.main-media-container {
  height: 550px;
  width: 100%;
  background: #f5f5f5; 
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
</style>