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

    <v-row v-if="loading">
      <v-col cols="12" class="text-center py-12">
        <v-progress-circular indeterminate color="primary" size="64" />
      </v-col>
    </v-row>

    <v-row v-else>
      <!-- IMAGEN -->
      <v-col cols="12" md="6">
        <v-card flat class="rounded-xl overflow-hidden border">
          <v-img
            :src="imageSize(record.imageDisplay, 'large')"
            height="550"
            contain
            class="bg-grey-lighten-3"
          >
            <template #placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-progress-circular indeterminate color="primary" />
              </v-row>
            </template>
          </v-img>
        </v-card>
      </v-col>

      <!-- INFO -->
      <v-col cols="12" md="6">
        <div class="pa-md-6">
          <h1 class="text-h3 font-weight-bold mb-2">
            {{ record.displayTitle }}
          </h1>

          <div
            v-if="record.cleanCollections"
            class="text-overline text-primary mb-6"
          >
            {{ record.cleanCollections }}
          </div>

          <v-divider class="mb-6"></v-divider>

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
import { ref, onMounted, watch } from "vue"
import { useRoute, useRouter } from "vue-router"

import PageLayout from "@/components/PageLayout.vue"
import MetadataViewer from "@/components/MetadataViewer.vue"
import MediaGallery from "@/components/MediaGallery.vue"

import api from "@/services/api"
import { normalizeRecord } from "@/utils/normalizeRecord"
import { imageSize } from "@/utils/imageSize"

const route = useRoute()
const router = useRouter()

const record = ref({})
const relatedRecords = ref([])
const loading = ref(true)
const tab = ref("all")

const onBasicSearch = (query) => {
  router.push({ path: "/record", query: { q: query } })
}

const loadData = async () => {
  loading.value = true
  relatedRecords.value = []

  try {
    const res = await api.getRecord(route.params.id)
    const recData = res.data?.data || res.data?.item || res.data || {}

    record.value = normalizeRecord(recData)

    let items = []

    // =========================
    // 1. MISMA COLECCIÓN
    // =========================
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

    // =========================
    // 2. MISMO AUTOR
    // =========================
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

    // =========================
    // 3. RANDOM
    // =========================
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

const navigateToRecord = (id) => {
  router.push(`/record/${id}`)
}

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