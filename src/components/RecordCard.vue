<template>
  <v-card
    class="record-card hoverable"
    @click="$router.push('/record/' + normalized.id)"
  >
    <v-img
      :src="normalized.thumbnail"
      height="180"
      cover
      class="rounded-t-lg"
    />

    <v-card-title class="record-title">
      {{ normalized.title }}
    </v-card-title>
  </v-card>
</template>

<script>
const API_BASE = 'https://arcadium.cluster24.libnamic.eu'

export default {
  props: { record: Object },

  computed: {
    normalized() {
      const r = this.record || {}

      const title =
        r.title ||
        r.metadata_fields?.["dcterms:title"]?.[0]?.["@value"] ||
        "Sin título"

      let thumbnail = r.thumbnail
      if (!thumbnail) thumbnail = '/placeholder.png'
      else if (!/^https?:\/\//.test(thumbnail)) {
        thumbnail = `${API_BASE}${thumbnail.startsWith('/') ? '' : '/'}${thumbnail}`
      }

      return {
        id: r.id,
        title,
        thumbnail
      }
    }
  }
}
</script>

<style scoped>
.record-card {
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.record-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.record-title {
  font-size: 0.95rem;
  font-weight: 600;
}
</style>