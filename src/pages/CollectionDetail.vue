<template>
  <PageLayout @basic-search="onBasicSearch">

    <v-btn to="/collection" variant="text" prepend-icon="mdi-arrow-left" class="mb-4">
      Volver a colecciones
    </v-btn>

    <div class="mb-10">
      <h1 class="text-h3 font-weight-bold mb-4">
        {{ collection.title }}
      </h1>

      <p class="text-body-1 text-grey-darken-2" style="max-width: 800px; line-height: 1.7;">
        {{ collection.description || 'Sin descripción disponible para esta colección.' }}
      </p>
    </div>

    <v-divider class="mb-8" />

    <h2 class="text-h5 font-weight-bold mb-6">
      Objetos en esta colección
    </h2>

    <!-- LOADING -->
    <v-row v-if="loadingRecords">
      <v-col v-for="i in 8" :key="i" cols="12" sm="6" md="4" lg="3">
        <v-skeleton-loader type="image, article" />
      </v-col>
    </v-row>

    <!-- RECORDS -->
    <v-row v-else-if="childRecords.length">
      <v-col
        v-for="record in childRecords"
        :key="record.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card
          flat
          class="record-card"
          @click="$router.push('/record/' + record.id)"
        >

          <v-img
            v-if="record.imageDisplay"
            :src="record.imageDisplay"
            height="220"
            cover
            class="rounded-lg bg-grey-lighten-2 mb-3"
          >
            <template #placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-progress-circular indeterminate />
              </v-row>
            </template>
          </v-img>

          <div v-else class="image-fallback">
            <v-icon size="40" color="grey">mdi-image-off-outline</v-icon>
          </div>

          <v-card-title class="pa-0 text-body-1 font-weight-bold">
            {{ record.displayTitle }}
          </v-card-title>

        </v-card>
      </v-col>
    </v-row>

    <v-alert v-else type="info" variant="tonal" class="mt-4">
      No hay objetos registrados en esta colección todavía.
    </v-alert>

    <!-- MEDIA -->
    <div v-if="collectionMedia.length" class="mt-12">
      <h2 class="text-h5 font-weight-bold mb-6">
        Documentos y Media
      </h2>

      <v-row>
        <v-col
          v-for="media in collectionMedia"
          :key="media.id"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card flat class="rounded-lg overflow-hidden border">

            <v-img
              v-if="media.imageDisplay"
              :src="media.imageDisplay"
              height="220"
              cover
              class="rounded-lg bg-grey-lighten-2 mb-3"
            >
              <template #placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular indeterminate />
                </v-row>
              </template>
            </v-img>

            <div v-else class="image-fallback">
              <v-icon size="40" color="grey">mdi-image-off-outline</v-icon>
            </div>

            <v-card-actions v-if="media.attachment">
              <v-btn
                block
                variant="flat"
                color="primary"
                :href="API_BASE + (media.attachment.url?.startsWith('/') ? '' : '/') + media.attachment.url"
                target="_blank"
                prepend-icon="mdi-download"
              >
                Descargar Archivo
              </v-btn>
            </v-card-actions>

          </v-card>
        </v-col>
      </v-row>
    </div>

  </PageLayout>
</template>

<script setup>
import { ref, computed, watch } from "vue"
import { useRoute } from "vue-router"
import PageLayout from "@/components/PageLayout.vue"
import api from "@/services/api"
import { normalizeRecord } from "@/utils/normalizeRecord"

const route = useRoute()

// ✅ ID seguro (evita undefined)
const collectionId = computed(() => route.params.id)

const API_BASE = "https://arcadium.cluster24.libnamic.eu"

const collection = ref({
  title: "Cargando...",
  description: ""
})

const childRecords = ref([])
const collectionMedia = ref([])
const loadingRecords = ref(true)

// 🔥 SEARCH FIX (PageLayout warning)
const onBasicSearch = (q) => {
  console.log("search:", q)
}

// 🔥 carga principal
const loadCollection = async (id) => {
  if (!id) return

  loadingRecords.value = true

  try {
    const collResponse = await api.getCollection(id, {
      with_labels: 1,
      fields: "id,title,description,children,thumbnail,preview"
    })

    collection.value = collResponse.data || {
      title: "Sin título",
      description: ""
    }

    const recordsResponse = await api.getRecords({
      with_labels: 1,
      fields: "id,title,thumbnail,preview",
      filters: [
        {
          field: "collections",
          operator: "in",
          value: [id]
        }
      ],
      limit: 100
    })

    const apiRecords =
      recordsResponse.data?.data ||
      recordsResponse.data?.items ||
      []

    childRecords.value = apiRecords.map(normalizeRecord)

    // MEDIA SEGURA
    if (collection.value.children?.length) {
      const mediaPromises = collection.value.children
        .filter(c => c?.id)
        .map(c =>
          api.getCollection(c.id, {
            with_labels: 1,
            fields: "id,thumbnail,preview,attachment"
          })
        )

      const mediaResults = await Promise.all(mediaPromises)

      collectionMedia.value = mediaResults.map(r => {
        const d = r.data?.data || r.data
        return normalizeRecord(d)
      })
    } else {
      collectionMedia.value = []
    }

  } catch (e) {
    console.error("Error cargando la colección:", e)
  } finally {
    loadingRecords.value = false
  }
}

// 🔥 reactivo a la ruta
watch(
  () => collectionId.value,
  (id) => {
    if (id) loadCollection(id)
  },
  { immediate: true }
)
</script>


<style scoped>
.record-card {
  cursor: pointer;
  background: transparent !important;

  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;

  padding: var(--card-padding-lg) !important;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.record-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.05);
}



.rounded-lg {
  border-radius: 12px !important;
}

.image-fallback {
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f3f3;
  border-radius: 12px;
}
</style>