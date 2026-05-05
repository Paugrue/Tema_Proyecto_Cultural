<template>
  <div v-if="processed && processed.length" class="metadata-container">

    <div
      v-for="(row, i) in processed"
      :key="i"
      class="metadata-row"
    >
      <!-- LABEL -->
      <div class="metadata-label">
        {{ row.label }}
      </div>

      <!-- VALUES -->
      <div class="metadata-value">
        <div
          v-for="(v, j) in row.values"
          :key="j"
          class="metadata-item"
        >

          <!-- ===================== -->
          <!-- TEXTO -->
          <!-- ===================== -->
          <span v-if="v.type === 'text'">
            {{ v.value }}
          </span>

          <!-- ===================== -->
          <!-- LINK -->
          <!-- ===================== -->
          <a
            v-else-if="v.type === 'link'"
            :href="v.value"
            target="_blank"
            class="metadata-link"
          >
            {{ v.label || v.value }}
          </a>

          <!-- ===================== -->
          <!-- RESOURCE -->
          <!-- ===================== -->
          <template v-else-if="v.type === 'resource' && v.value">

            <!-- RECORD -->
            <router-link
              v-if="v.value.type === 'record'"
              :to="`/record/${v.value.id}`"
              class="metadata-link"
            >
              {{ v.label || v.value.title }}
            </router-link>

            <!-- COLLECTION -->
            <router-link
              v-else-if="v.value.type === 'collection'"
              :to="`/collection/${v.value.id}`"
              class="metadata-link"
            >
              {{ v.label || v.value.title }}
            </router-link>

            <!-- MEDIA -->
            <span v-else-if="v.value.type === 'medio'">
              {{ v.label || v.value.title }}
            </span>

          </template>

          <!-- ===================== -->
          <!-- FALLBACK CONTROLADO -->
          <!-- ===================== -->
          <span v-else>
            {{ v.label || v.value || '—' }}
          </span>

        </div>
      </div>
    </div>

  </div>

  <div v-else class="text-grey text-body-2 py-4">
    Sin metadatos detallados
  </div>
</template>

<script setup>
import { computed } from "vue"
import { processMetadata } from "@/utils/metadataProcessor"

const props = defineProps({
  metadata: { type: Object, default: () => ({}) }
})

const processed = computed(() => processMetadata(props.metadata))

// -------- recursos --------
const getMime = (v) => v?.mime || v?.mimetype || ""

const isImage = (v) => getMime(v).startsWith("image")
const isVideo = (v) => getMime(v).startsWith("video")
const isAudio = (v) => getMime(v).startsWith("audio")
</script>

<style scoped>
.metadata-row {
  display: grid;
  grid-template-columns: 160px 1fr;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}
.metadata-label {
  font-size: 11px;
  text-transform: uppercase;
  font-weight: bold;
  color: #888;
}
.metadata-link { color: #6200ee; text-decoration: none; }
.metadata-link:hover { text-decoration: underline; }
</style>