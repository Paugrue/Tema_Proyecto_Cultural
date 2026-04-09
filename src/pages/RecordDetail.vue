<template>
  <PageLayout>
    <v-btn :to="{ path: '/record', query: route.query }" variant="text" prepend-icon="mdi-arrow-left" class="mb-4">
      Volver al listado
    </v-btn>

    <!-- LOADING -->
    <v-row v-if="loading">
      <v-col cols="12" class="text-center py-12">
        <v-progress-circular indeterminate color="primary" size="64" />
      </v-col>
    </v-row>

    <!-- RECORD DETAIL -->
    <v-row v-else>
      <!-- IMAGEN -->
      <v-col cols="12" md="6">
        <v-card flat class="rounded-xl overflow-hidden border">
          <v-img
            :src="record.imageDisplay || '/placeholder.png'"
            height="550"
            cover
            class="bg-grey-lighten-3"
          />
        </v-card>
      </v-col>

      <!-- DATOS -->
      <v-col cols="12" md="6">
        <div class="pa-md-6">

          <h1 class="text-h3 font-weight-bold mb-2">
            {{ record.displayTitle }}
          </h1>

          <div v-if="record.cleanCollections" class="text-overline text-primary mb-6">
            {{ record.cleanCollections }}
          </div>

          <v-divider class="mb-6"></v-divider>

          <div class="metadata-block mb-10">
            <h2 class="metadata-header">Metadatos</h2>

            <div class="metadata-row" v-if="record.displayYear">
              <div class="metadata-label">Fecha</div>
              <div class="metadata-value">{{ record.displayYear }}</div>
            </div>

            <div class="metadata-row">
              <div class="metadata-label">Título</div>
              <div class="metadata-value">{{ record.displayTitle }}</div>
            </div>

            <div class="metadata-row" v-if="record.displayAuthor">
              <div class="metadata-label">Creador</div>
              <div class="metadata-value">{{ record.displayAuthor }}</div>
            </div>

            <div class="metadata-row" v-if="record.displayDescription">
              <div class="metadata-label">Descripción</div>
              <div class="metadata-value">
                {{ record.displayDescription }}
              </div>
            </div>
          </div>

        </div>
      </v-col>
    </v-row>

    <v-divider class="my-12"></v-divider>

    <!-- RELACIONADOS -->
    <div v-if="relatedRecords.length">
      <h2 class="text-h5 font-weight-bold mb-6">También te puede interesar</h2>

      <v-row>
        <v-col v-for="r in relatedRecords" :key="r.id" cols="12" sm="6" md="3">
          <v-card
            flat
            class="related-card pa-4 d-flex flex-column ga-3"
            @click="navigateToRecord(r.id)"
          >

            <v-img
              :src="r.imageDisplay || '/placeholder.png'"
              height="200"
              cover
              class="rounded-lg bg-grey-lighten-2"
            />

            <div class="related-title">
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
import api from "@/services/api"
import { normalizeRecord } from "@/utils/normalizeRecord"

const route = useRoute()
const router = useRouter()

const record = ref({})
const relatedRecords = ref([])
const loading = ref(true)

const loadData = async () => {
  loading.value = true

  try {
    const res = await api.getRecord(route.params.id)

    const recData =
      res.data?.data ||
      res.data?.item ||
      res.data

    record.value = normalizeRecord(recData)

    if (recData?.collections?.length) {
      const relatedRes = await api.getRecords({
        limit: 4,
        filters: [
          {
            field: "collections",
            operator: "in",
            value: recData.collections
          },
          {
            field: "id",
            operator: "ne",
            value: recData.id
          }
        ]
      })

      const items =
        relatedRes.data?.data ||
        relatedRes.data?.items ||
        []

      relatedRecords.value = items.map(normalizeRecord)
    }

  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const navigateToRecord = (id) => router.push('/record/' + id)

onMounted(loadData)
watch(() => route.params.id, loadData)
</script>

<style scoped>
/* =========================================================
   BLOQUE DE METADATOS (FICHA EDITORIAL)
   ========================================================= */

.metadata-block {
  margin-top: 48px;
}

/* ---------------------------------------------------------
   CABECERA DEL BLOQUE
   --------------------------------------------------------- */

.metadata-header {
  font-family: var(--font-serif);
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 28px;
  color: var(--color-heading);
}

/* ---------------------------------------------------------
   FILAS DE METADATOS (ESTILO CATALOGO)
   --------------------------------------------------------- */

.metadata-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  padding: 16px 0;
  border-top: 1px solid var(--color-border);
}

.metadata-row:last-child {
  border-bottom: 1px solid var(--color-border);
}

/* ---------------------------------------------------------
   ETIQUETAS (CLAVE DE ARCHIVO)
   --------------------------------------------------------- */

.metadata-label {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 600;
  color: rgba(30, 30, 30, 0.55);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* ---------------------------------------------------------
   VALORES
   --------------------------------------------------------- */

.metadata-value {
  font-family: var(--font-sans);
  font-size: 15px;
  color: var(--color-text);
  line-height: 1.6;
}

/* =========================================================
   RELACIONADOS (SUTIL, NO COMERCIAL)
   ========================================================= */

.related-card {
  background-color: #E6C08E !important;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 12px;

  cursor: pointer;
  padding: 16px;

  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.related-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}
</style>
