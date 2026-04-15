<template>
  <div v-if="processed.length" class="metadata-container">
    <div v-for="(row, i) in processed" :key="i" class="metadata-row">
      <div class="metadata-label">{{ row.label }}</div>
      <div class="metadata-value">
        <div v-for="(v, j) in row.values" :key="j">
          <span v-if="v.type === 'text'">{{ v.value }}</span>
          
          <a v-else-if="v.type === 'link'" :href="v.value" target="_blank" class="metadata-link">
            {{ v.value }}
          </a>

          <router-link v-else-if="v.type === 'resource'" :to="`/record/${v.value}`" class="metadata-link">
            {{ v.label }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-grey text-body-2 py-4">Sin metadatos detallados</div>
</template>

<script setup>
import { computed } from "vue"
import { processMetadata } from "@/utils/metadataProcessor"

const props = defineProps({
  metadata: { type: Object, default: () => ({}) }
})

const processed = computed(() => processMetadata(props.metadata))
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