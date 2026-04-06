<template>
  <v-card class="record-card" @click="$router.push('/record/' + normalized.id)" >
    <v-img :src="normalized.thumbnail" height="200" cover class="record-image" />
    <v-card-text class="record-content">
      <div class="record-title">
        {{ normalized.title }}
      </div>
      <div v-if="normalized.collections" class="record-meta">
        {{ normalized.collections }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
const API_BASE = 'https://arcadium.cluster24.libnamic.eu'

export default {
  props: { record: Object },

  computed: {
    normalized() {
      const r = this.record || {}

      // Título
      const title = r.title || r.metadata_fields?.["dcterms:title"]?.[0]?.["@value"] || "Sin título"

      // Thumbnail
      let thumbnail = r.thumbnail
      if (!thumbnail) thumbnail = '/placeholder.png'
      else if (!/^https?:\/\//.test(thumbnail))
        thumbnail = `${API_BASE}${thumbnail.startsWith('/') ? '' : '/'}${thumbnail}`

      // Colecciones / Repositorios
      const collections = []

      // 1. collections_titles normales
      if (Array.isArray(r.collections_titles)) {
        collections.push(...r.collections_titles)
      }

      // 2. Repositorios tipo glam.record en dcterms:subject
      const subjects = r.metadata_fields?.["dcterms:subject"] || []
      subjects.forEach((s) => {
        if (s.model === "glam.record" && s.label) collections.push(s.label)
      })

      return {
        id: r.id,
        title,
        thumbnail,
        collections: collections.length ? collections.join(', ') : null
      }
    }
  }
}
</script>

<style scoped>

</style>