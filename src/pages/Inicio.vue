<template>
  <PageLayout>
    <div class="inicio-contenedor">
      <h2 class="inicio-title">Este es el sitio de Granada</h2>

      <div class="inicio-btn-grid">
        <RouterLink to="/collection">
          <v-btn class="inicio-btn" color="black" variant="flat" block>
            Colecciones
          </v-btn>
        </RouterLink>

        <RouterLink to="/record">
          <v-btn class="inicio-btn" color="black" variant="flat" block>
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
  </PageLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PageLayout from '@/components/PageLayout.vue'
import api from '@/services/api'

const collections = ref([])
const API_BASE = 'https://arcadium.cluster24.libnamic.eu'

onMounted(async () => {
  try {
    const { data } = await api.getCollections({
      with_labels: 1,
      fields: 'id,title,thumbnail',
      limit: 8
    })
    const items = data.items || data.results || data || []
    collections.value = items.map(c => ({
      ...c,
      thumbnailFull: normalizeThumb(c.thumbnail)
    }))
  } catch (e) {
    console.error('Error cargando colecciones destacadas:', e)
  }
})

function normalizeThumb(th) {
  if (!th) return '/placeholder.png'
  if (/^https?:\/\//i.test(th)) return th
  return `${API_BASE}${th.startsWith('/') ? '' : '/'}${th}`
}
</script>

<style scoped>
/* =========================================================
   CONTENEDOR INICIO
   ========================================================= */

.inicio-contenedor {
  margin-top: 32px;
  text-align: center;
}

/* =========================================================
   TÍTULO PRINCIPAL (EDITORIAL)
   ========================================================= */

.inicio-title {
  font-family: var(--font-serif);
  font-size: clamp(2.4rem, 5vw, 3.2rem);
  font-weight: 500;
  margin-bottom: 24px;
  color: var(--color-heading);
  letter-spacing: -0.3px;
}

/* =========================================================
   GRID DE BOTONES (EDITORIAL, NO CTA)
   ========================================================= */

.inicio-btn-grid {
  display: flex;
  justify-content: center;
  gap: 24px;
}

/* =========================================================
   BOTONES INICIO (CUADRADOS, SOBRIOS)
   ========================================================= */

.inicio-btn {
  height: 54px !important;
  padding: 0 32px !important;

  font-family: var(--font-sans);
  font-size: 16px !important;
  font-weight: 500 !important;
  letter-spacing: 0.2px;

  border-radius: 8px !important; /* ❌ no pastilla */
  border: 1px solid var(--color-primary) !important;

  background: var(--color-primary) !important;
  color: #ffffff !important;

  box-shadow: none !important;
  transition: background-color 0.25s ease, transform 0.25s ease;

}

/* Hover editorial */
.inicio-btn:hover {
  background: var(--color-primary-hover) !important;
  transform: translateY(-1px);
}


/* Variante secundaria si la necesitas */
.inicio-btn--outline {
  background: transparent !important;
  color: var(--color-primary) !important;
}

.inicio-btn--outline:hover {
  background: rgba(107, 47, 58, 0.06) !important;
}

/* =========================================================
   DIVISOR EDITORIAL
   ========================================================= */

.inicio-divider {
  width: 100%;
  max-width: 420px;
  height: 1px;
  background: var(--color-border);
  margin: 56px auto 0 auto;
}

/* =========================================================
   EFECTOS HOVER (MUY SUTILES)
   ========================================================= */

.hoverable {
  transition: transform 0.25s ease;
}

.hoverable:hover {
  transform: translateY(-2px);
}

/* =========================================================
   RESPONSIVE
   ========================================================= */

@media (max-width: 768px) {
  .inicio-contenedor {
    margin-top: 56px;
  }

  .inicio-btn-grid {
    flex-direction: column;
    align-items: stretch;
  }

  .inicio-btn {
    width: 100%;
  }
}
</style>