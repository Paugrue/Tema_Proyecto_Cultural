<template>
  <PageLayout>
    <div class="inicio-contenedor">
      <h2 class="inicio-title">Este es el sitio de Granada</h2>

      <div class="inicio-btn-grid">
        <RouterLink to="/collection">
          <v-btn class="inicio-btn inicio-btn--small" variant="flat" block>
            Colecciones
          </v-btn>
        </RouterLink>

        <RouterLink to="/record">
          <v-btn class="inicio-btn inicio-btn--small" variant="flat" block>
            Registros
          </v-btn>
        </RouterLink>
      </div>

      <div class="inicio-divider"></div>
    </div>

    <!-- Destacados -->
    <v-row class="mt-8" v-if="collections.length">
      <v-col
        v-for="col in collections"
        :key="col.id"
        cols="12" sm="6" md="4" lg="3"
      >
        <v-card
          class="record-card hoverable"
          style="cursor:pointer"
          @click="$router.push('/collection/' + col.id)"
        >
          <v-img :src="col.thumbnailFull" height="180" cover class="rounded-t-lg" />
          <v-card-title>{{ col.title }}</v-card-title>
        </v-card>
      </v-col>
    </v-row>

    <!-- PAGINACIÓN -->
    <v-row v-if="collections.length" class="mt-6">
      <v-col cols="12" class="d-flex justify-center align-center">

        <v-btn
          variant="outlined"
          :disabled="page === 1"
          @click="changePage(page - 1)"
        >
          ←
        </v-btn>

        <div class="mx-4" style="min-width: 40px; text-align:center; font-weight:600;">
          {{ page }}
        </div>

        <v-btn
          variant="outlined"
          :disabled="!hasNextPage"
          @click="changePage(page + 1)"
        >
          →
        </v-btn>

      </v-col>
    </v-row>

  </PageLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PageLayout from '@/components/PageLayout.vue'
import api from '@/services/api'

const collections = ref([])
const API_BASE = 'https://arcadium.cluster24.libnamic.eu'

/* PAGINACIÓN */
const page = ref(1)
const limit = 6
const hasNextPage = ref(false)

/* IMÁGENES */
function normalizeThumb(th) {
  if (!th) return '/placeholder.png'
  if (/^https?:\/\//i.test(th)) return th
  return `${API_BASE}${th.startsWith('/') ? '' : '/'}${th}`
}

/* FETCH */
async function fetchCollections() {
  try {
    const { data } = await api.getCollections({
      with_labels: 1,
      fields: 'id,title,thumbnail',
      limit: limit,
      offset: (page.value - 1) * limit
    })

    const items = data.items || data.results || data || []

    collections.value = items.map(c => ({
      ...c,
      thumbnailFull: normalizeThumb(c.thumbnail)
    }))

    hasNextPage.value = items.length === limit

  } catch (e) {
    console.error('Error cargando colecciones destacadas:', e)
  }
}

/* CAMBIO DE PÁGINA */
function changePage(newPage) {
  if (newPage < 1) return
  if (newPage > page.value && !hasNextPage.value) return

  page.value = newPage
  fetchCollections()
}

onMounted(fetchCollections)
</script>

<style scoped>

/* CENTRAR TÍTULO */
.inicio-title {
  font-family: var(--font-serif);
  font-size: clamp(2.4rem, 5vw, 3.2rem);
  font-weight: 500;
  margin-bottom: 24px;
  color: var(--color-heading);
  letter-spacing: -0.3px;
  text-align: center;
}

/* BOTONES GRID */
.inicio-btn-grid {
  display: flex;
  justify-content: center;
  gap: 24px;
}

/* BOTÓN VERDE MÁS PEQUEÑO */
.inicio-btn {
  border-radius: 8px !important;
  box-shadow: none !important;
  transition: background-color 0.25s ease, transform 0.25s ease;
}

.inicio-btn--small {
  height: 42px !important;
  font-size: 14px !important;
  padding: 0 20px !important;

  background: var(--color-primary) !important;
  color: #ffffff !important;
  border: none !important;
}

.inicio-btn--small:hover {
  background: var(--color-primary-hover) !important;
  transform: translateY(-1px);
}

/* DIVISOR */
.inicio-divider {
  width: 100%;
  max-width: 420px;
  height: 1px;
  background: var(--color-border);
  margin: 56px auto 0 auto;
}

/* HOVER CARDS */
.hoverable {
  transition: transform 0.25s ease;
}

.hoverable:hover {
  transform: translateY(-2px);
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .inicio-btn-grid {
    flex-direction: column;
    align-items: stretch;
  }

  .inicio-btn {
    width: 100%;
  }
}
</style>