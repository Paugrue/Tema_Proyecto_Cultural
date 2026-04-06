<template>
  <PageLayout>
    <v-btn to="/collection" variant="text" prepend-icon="mdi-arrow-left" class="mb-4">
      Volver a colecciones
    </v-btn>

    <div class="mb-10">
      <h1 class="text-h3 font-weight-bold mb-4">{{ collection.title }}</h1>
      <p class="text-body-1 text-grey-darken-2" style="max-width: 800px; line-height: 1.7;">
        {{ collection.description || 'Sin descripción disponible para esta colección.' }}
      </p>
    </div>

    <v-divider class="mb-8"></v-divider>

    <h2 class="text-h5 font-weight-bold mb-6">Objetos en esta colección</h2>
    
    <v-row v-if="loadingRecords">
      <v-col v-for="i in 8" :key="i" cols="12" sm="6" md="4" lg="3">
        <v-skeleton-loader type="image, article" />
      </v-col>
    </v-row>

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
            :src="record.imageDisplay"
            :alt="record.displayTitle"
            height="220"
            cover
            class="rounded-lg bg-grey-lighten-2 mb-3"
          >
            <template v-slot:placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-progress-circular indeterminate color="grey-lighten-1" />
              </v-row>
            </template>
          </v-img>
          
          <v-card-title class="pa-0 text-body-1 font-weight-bold line-clamp-2" style="line-height: 1.3;">
            {{ record.displayTitle }}
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>

    <v-alert v-else type="info" variant="tonal" class="mt-4">
      No hay objetos registrados en esta colección todavía.
    </v-alert>

    <div v-if="collectionMedia.length" class="mt-12">
      <h2 class="text-h5 font-weight-bold mb-6">Documentos y Media</h2>
      <v-row>
        <v-col
          v-for="media in collectionMedia"
          :key="media.id"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card flat class="rounded-lg overflow-hidden border">
            <v-img :src="media.imageDisplay" height="200" cover />
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
import { ref, onMounted } from "vue"
import { useRoute } from "vue-router"
import PageLayout from "@/components/PageLayout.vue"
import api from "@/services/api"

const route = useRoute()
const collectionId = route.params.id
const API_BASE = "https://arcadium.cluster24.libnamic.eu"

const collection = ref({ title: 'Cargando...', description: '' })
const childRecords = ref([])
const collectionMedia = ref([])
const loadingRecords = ref(true)

/**
 * Función auxiliar para limpiar metadatos (reutilizada de RecordList)
 */
function getCleanText(field) {
  if (!field) return '';
  if (typeof field === 'object') {
    const firstKey = Object.keys(field)[0];
    const content = field[firstKey] || field;
    return content.value || content['@value'] || content[0]?.value || (typeof content === 'string' ? content : '');
  }
  return field;
}

/**
 * Normalización mejorada
 */
function normalizeItem(r) {
  let img = r.preview || r.thumbnail || r.image || '/placeholder.png';
  if (img !== '/placeholder.png' && !img.startsWith('http')) {
    img = `${API_BASE}${img.startsWith('/') ? '' : '/'}${img}`;
  }

  // Usar la misma lógica de títulos que en la lista principal
  const titleField = r.metadata_fields?.['dcterms:title'] || r.title || r.name;
  const displayTitle = getCleanText(titleField);

  return {
    ...r,
    displayTitle: displayTitle || 'Sin título',
    imageDisplay: img
  }
}

onMounted(async () => {
  try {
    // 1. Datos de la colección principal
    const collResponse = await api.getCollection(collectionId, {
      with_labels: 1,
      fields: "id,title,description,children,thumbnail,preview"
    })
    collection.value = collResponse.data || { title: 'Sin título', description: '' }

    // 2. Carga de Registros que pertenecen a esta colección
    // IMPORTANTE: Enviamos el array de filtros directamente, no como String JSON
    const recordsResponse = await api.getRecords({
      with_labels: 1,
      fields: "id,title,thumbnail,preview,metadata_fields",
      filters: [{ field: "collections", operator: "in", value: [collectionId] }],
      limit: 100
    })
    
    const apiRecords = recordsResponse.data?.data || recordsResponse.data?.items || []
    childRecords.value = apiRecords.map(normalizeItem)
    loadingRecords.value = false

    // 3. Carga de Media (Si existen sub-colecciones o hijos media)
    if (collection.value.children && collection.value.children.length) {
      const mediaPromises = collection.value.children.map(c =>
        api.getCollection(c.id, { with_labels: 1, fields: "id,thumbnail,preview,attachment" })
      )
      const mediaResults = await Promise.all(mediaPromises)
      collectionMedia.value = mediaResults
        .filter(r => r.data)
        .map(r => normalizeItem(r.data))
    }
  } catch (e) {
    console.error("Error cargando la colección:", e)
    loadingRecords.value = false
  }
})
</script>

<style scoped>
/* =========================================================
   TARJETA DE REGISTRO (CATÁLOGO EDITORIAL)
   ========================================================= */

.record-card {
  cursor: pointer;
  background: transparent !important;

  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

/* Hover sobrio: exploración, no CTA */
.record-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.05);
}

/* =========================================================
   LIMITADOR DE TEXTO
   ========================================================= */

.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

/* =========================================================
   REDONDEO EDITORIAL
   ========================================================= */

.rounded-lg {
  border-radius: 12px !important;
}
</style>