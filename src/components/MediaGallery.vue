<template>
  <div class="media-gallery-container pa-4">
    <v-row v-if="items && items.length" class="mt-4">
      <v-col
        v-for="(m, index) in items"
        :key="m.id || index"
        cols="12"
        sm="6"
        md="4"
        lg="4"
      >

        <v-card flat class="media-item-card bg-transparent">

          <!-- IMAGEN -->
          <v-img
            v-if="safeThumbnail(m) && !failedImages.has(m.id)"
            :src="safeThumbnail(m)"
            height="180"
            cover
            @click="openViewer(index)"
            @error="onImageError(m)"
          >
            <template #placeholder>
              <div class="d-flex align-center justify-center" style="height:100%;">
                <v-progress-circular indeterminate size="24" />
              </div>
            </template>

            <template #error>
              <div class="d-flex align-center justify-center" style="height:100%;">
                🖼
              </div>
            </template>
          </v-img>

          <!-- FALLBACK -->
          <div
            v-else
            style="height:180px; display:flex; align-items:center; justify-content:center; background:#eee; cursor:pointer;"
            @click="openViewer(index)"
          >
            📄 {{ isPdfFile(m) ? 'PDF' : 'Sin imagen' }}
          </div>

          <!-- CONTENIDO -->
          <div class="media-content">
            <div class="media-title-text mb-1">
              {{ m.title || 'Sin título' }}
            </div>

            <div class="d-flex flex-column ga-1">
              <span class="action-link-orange cursor-pointer" @click="openViewer(index)">
                Ver archivo
              </span>

<a
  :href="m.full"
  target="_blank"
  rel="noopener"
  class="action-link-orange"
  @click.prevent="forceDownload(m)"
>
  Descargar
</a>
            </div>
          </div>

        </v-card>
      </v-col>
    </v-row>

    <!-- VIEWER -->
    <v-dialog
      v-model="viewerDialog"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card class="bg-black">

        <v-toolbar flat color="transparent" class="position-absolute" style="z-index: 10; width: 100%">
          <v-spacer />
          <v-btn
            icon="mdi-close"
            color="white"
            @click="viewerDialog = false"
            class="bg-grey-darken-4 ma-2"
          />
        </v-toolbar>

        <v-row no-gutters align="center" justify="center" class="fill-height pa-4">
          <v-col cols="12" class="d-flex justify-center align-center fill-height">

            <!-- IMAGEN -->
            <v-img
              v-if="selectedImage && !isPdfFile(selectedImage)"
              :src="selectedImage.full"
              contain
              max-height="90vh"
              width="100%"
            >
              <template #placeholder>
                <v-progress-circular indeterminate color="white" />
              </template>
            </v-img>

            <!-- PDF -->
            <iframe
              v-else-if="selectedImage && isPdfFile(selectedImage)"
              :src="selectedImage.full"
              style="width:100%; height:90vh; border:none;"
            />

          </v-col>
        </v-row>

        <div
          v-if="selectedImage"
          class="position-absolute w-100 text-center py-6"
          style="bottom: 0; background: linear-gradient(transparent, rgba(0,0,0,0.8))"
        >
          <h2 class="text-white text-h6">
            {{ selectedImage.title }}
          </h2>
        </div>

      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  items: { type: Array, default: () => [] }
});

const viewerDialog = ref(false);
const selectedImage = ref(null);

/* =========================
   VIEWER
========================= */
const openViewer = (index) => {
  selectedImage.value = props.items[index];
  viewerDialog.value = true;
};

/* =========================
   FALLBACK IMÁGENES
========================= */
const failedImages = ref(new Set());

const onImageError = (item) => {
  if (item?.id) failedImages.value.add(item.id);
};

/* =========================
   PDF DETECTION (ÚNICA FUENTE DE VERDAD)
========================= */
const isPdfFile = (item) => {
  return (
    item?.isPdf === true ||
    /\.pdf(\?|$)/i.test(item?.full || '')
  );
};

/* =========================
   SAFE THUMBNAIL
========================= */
const safeThumbnail = (m) => {
  const url = m?.thumbnail;
  if (!url || typeof url !== "string") return null;

  const cleaned = url.trim();

  if (
    !cleaned ||
    cleaned === "null" ||
    cleaned === "undefined" ||
    cleaned.includes("undefined")
  ) return null;

  try {
    return new URL(cleaned, window.location.origin).href;
  } catch {
    return null;
  }
};

const getMainViewerSrc = (item) => {
  if (!item) return null;

  // si viene de PDF → usar thumbnail (NO full)
  if (item.isPdf) {
    return item.thumbnail;
  }

  return item.full;
};

/* =========================
   DESCARGA DE ARCHIVOS
========================= */
const downloadFile = async (item) => {
  try {
    const response = await fetch(item.full, {
      credentials: "include"
    })

    const blob = await response.blob()

    const url = window.URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url

    // importante: añadir extensión
    const filename = item.isPdf
      ? (item.title?.endsWith(".pdf") ? item.title : item.title + ".pdf")
      : item.title || "archivo"

    a.download = filename

    document.body.appendChild(a)
    a.click()
    a.remove()

    window.URL.revokeObjectURL(url)

  } catch (e) {
    console.error("Error descarga:", e)
    alert("No se pudo descargar automáticamente")
  }
}

const forceDownload = (item) => {
  const url = item.full;

  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener";

  // esto SOLO funciona si el servidor lo permite
  a.download = item.title || "archivo";

  document.body.appendChild(a);
  a.click();
  a.remove();
};

const getFileName = (item) => {
  if (!item?.title) return "archivo"

  // asegurar extensión
  if (item.isPdf) return item.title.endsWith(".pdf") ? item.title : item.title + ".pdf"

  return item.title
}

</script>


<style scoped>
.media-gallery-container {
  padding: 16px;
}

.media-title-text {
  color: #333;
  font-size: 0.875rem;
  line-height: 1.4;
  font-weight: 500;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 2.8em;
}

.action-link-orange {
  color: #ff6d00 !important;
  text-decoration: none !important;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  width: fit-content;
}

.action-link-orange:hover {
  text-decoration: underline !important;
}

.cursor-pointer {
  cursor: pointer;
}

.fill-height {
  height: 100vh;
}
</style>