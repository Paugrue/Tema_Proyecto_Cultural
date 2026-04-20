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

        <!-- IMAGEN -->
        <v-img
  v-if="mainMedia && mainMedia.thumbnail"
  :src="imageSize(mainMedia.thumbnail, 'large')"
  height="550"
  cover
/>

        <!-- PDF -->
        <div v-else-if="mainMedia && mainMedia.isPdf">
          <canvas
            ref="pdfCanvas"
            style="width:100%; height:auto; display:block;"
          ></canvas>
        </div>

      </v-col>

      <!-- INFO -->
      <v-col cols="12" md="6">
        <div class="pa-md-6">
          <h1 class="text-h3 font-weight-bold mb-2">
            {{ record.displayTitle }}
          </h1>

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

  </PageLayout>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { nextTick } from "vue"

import PageLayout from "@/components/PageLayout.vue"
import MetadataViewer from "@/components/MetadataViewer.vue"
import MediaGallery from "@/components/MediaGallery.vue"

import api from "@/services/api"
import { normalizeRecord } from "@/utils/normalizeRecord"
import { imageSize } from "@/utils/imageSize"

import * as pdfjsLib from "pdfjs-dist"

// =========================
// PDF.js setup
// =========================

import pdfWorker from "pdfjs-dist/build/pdf.worker.min?url"

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker
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

const pdfCanvas = ref(null)

// =========================
// MAIN MEDIA (IMPORTANTE)
// =========================
const mainMedia = computed(() => {
  const media = record.value.mediaItems || []

  const image = media.find(m => !m.isPdf)
  return image || media[0] || null
})

// =========================
// PDF RENDER
// =========================
const renderPdf = async () => {
  try {
    const media = mainMedia.value

    console.log("📄 PDF URL:", media.full)

    const pdf = await pdfjsLib.getDocument(media.full).promise

    console.log("📄 PDF cargado, páginas:", pdf.numPages)

    const page = await pdf.getPage(1)

    const viewport = page.getViewport({ scale: 1.5 })

    const canvas = pdfCanvas.value

    console.log("🖼 canvas:", canvas)

    if (!canvas) {
      console.error("❌ Canvas no existe aún")
      return
    }

    const ctx = canvas.getContext("2d")

    canvas.width = viewport.width
    canvas.height = viewport.height

    const renderTask = page.render({
      canvasContext: ctx,
      viewport
    })

    await renderTask.promise

    console.log("✅ PDF render OK")
  } catch (err) {
    console.error("❌ PDF ERROR DETECTADO:", err)
  }
}

// 🔥 clave: reacciona cuando cambia el media
watch(mainMedia, async (val) => {
  console.log("🔥 mainMedia:", val)

  if (!val?.isPdf) return

  await nextTick()

  console.log("🔥 rendering PDF...")

  renderPdf()
})

// =========================
// LOAD DATA
// =========================
const loadData = async () => {
  loading.value = true
  relatedRecords.value = []

  try {
    const res = await api.getRecord(route.params.id)
    const recData = res.data?.data || res.data?.item || res.data || {}

    record.value = normalizeRecord(recData)

    let items = []

    if (recData?.collections?.length) {
      const col = recData.collections[0]
      const colId = typeof col === "object" ? col.id : col

      const r = await api.getRecords({
        limit: 10,
        filters: [
          { field: "collections", operator: "in", value: [colId] },
          { field: "id", operator: "ne", value: recData.id }
        ]
      })

      items = r.data?.data || r.data?.items || []
    }

    if (!items.length && recData.creator) {
      const r = await api.getRecords({
        limit: 10,
        filters: [
          { field: "creator", operator: "like", value: recData.creator },
          { field: "id", operator: "ne", value: recData.id }
        ]
      })

      items = r.data?.data || r.data?.items || []
    }

    if (!items.length) {
      const r = await api.getRecords({ limit: 10 })
      items = r.data?.data || r.data?.items || []
    }

    const seen = new Set()

    relatedRecords.value = items
      .map(normalizeRecord)
      .filter(r => {
        if (!r?.id || seen.has(r.id)) return false
        seen.add(r.id)
        return true
      })
      .slice(0, 4)

  } catch (e) {
    console.error("RecordDetail error:", e)
  } finally {
    loading.value = false
  }
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
</style>