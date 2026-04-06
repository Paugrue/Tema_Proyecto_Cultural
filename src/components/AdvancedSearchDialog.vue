<template>
  <v-dialog v-model="open" max-width="920">
    <v-card class="pa-6" elevation="10" rounded="xl">
      <v-card-title class="text-h5 d-flex align-center pb-4">
        Búsqueda Avanzada
      </v-card-title>

      <v-card-text class="pa-0">
        <!-- ALCANCE -->
        <div class="mb-6">
          <div class="text-subtitle-2 mb-2 text-grey-darken-2 font-weight-bold">
            Alcance
          </div>

          <v-btn-toggle
            v-model="form.scope"
            color="primary"
            variant="outlined"
            mandatory
            class="w-100"
          >
            <v-btn value="records" class="flex-grow-1">Registros</v-btn>
            <v-btn value="collections" class="flex-grow-1">Colecciones</v-btn>
            <v-btn value="all" class="flex-grow-1">Todo</v-btn>
          </v-btn-toggle>
        </div>

        <!-- TÉRMINO GENERAL -->
        <v-text-field
          v-model="form.query"
          label="Término general"
          variant="outlined"
          class="mb-6"
          clearable
          @keydown.enter.prevent="emitSearch"
        />

        <!-- FILTROS -->
        <v-card
          variant="flat"
          border
          class="pa-4 mb-6"
          color="grey-lighten-5"
        >
          <div class="d-flex align-center mb-4">
            <span class="text-subtitle-1 font-weight-bold me-4">
              Filtros específicos
            </span>

            <v-btn-toggle
              v-model="form.combine"
              density="compact"
              mandatory
              color="secondary"
            >
              <v-btn value="AND">Y</v-btn>
              <v-btn value="OR">O</v-btn>
            </v-btn-toggle>
          </div>

          <div class="d-flex flex-column ga-4">
            <div
              v-for="(rule, idx) in form.rules"
              :key="rule.id"
              class="d-flex align-center ga-2 w-100"
            >
              <!-- CAMPO -->
              <v-select
                v-model="rule.field"
                :items="fieldOptions"
                label="Campo"
                variant="outlined"
                density="compact"
                hide-details
                class="flex-grow-1"
              />

              <!-- OPERADOR -->
              <v-select
                v-model="rule.operator"
                :items="operatorOptions"
                label="Op."
                variant="outlined"
                density="compact"
                hide-details
                style="max-width: 120px"
              />

              <!-- VALOR -->
              <v-select
                v-if="rule.field === 'collections'"
                v-model="rule.value"
                :items="collections"
                label="Selecciona colección"
                variant="outlined"
                density="compact"
                hide-details
                multiple
                item-title="title"
                item-value="id"
                class="flex-grow-1"
                @keydown.enter.prevent="emitSearch"
              />

              <v-text-field
                v-else-if="!['isEmpty'].includes(rule.operator)"
                v-model="rule.value"
                label="Valor"
                variant="outlined"
                density="compact"
                hide-details
                class="flex-grow-1"
                @keydown.enter.prevent="emitSearch"
              />

              <!-- BOTÓN BORRAR -->
              <v-btn
                variant="flat"
                color="error"
                size="small"
                class="ml-2 flex-shrink-0 delete-btn"
                @click="removeRule(idx)"
                :disabled="form.rules.length <= 1"
              >
                <span class="delete-icon">✕</span>
              </v-btn>
            </div>

            <!-- AÑADIR FILTRO -->
            <v-btn
              variant="text"
              color="primary"
              @click="addRule"
            >
              + Añadir filtro
            </v-btn>

          </div>
        </v-card>
      </v-card-text>

      <v-card-actions class="px-0">
        <v-btn variant="text" @click="open = false">
          Cancelar
        </v-btn>

        <v-spacer />

        <v-btn
          color="primary"
          variant="flat"
          @click="emitSearch"
        >
          Buscar ahora
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  fields: Array,
  collections: Array,
  defaults: Object
})

const emit = defineEmits(['update:modelValue', 'do-advanced-search'])

// CONTROL DIALOG
const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})

// FORMULARIO
const form = reactive({
  scope: 'records',
  query: '',
  combine: 'AND',
  rules: []
})

// Generador de IDs únicos para filtros
const generateId = () => Math.random().toString(36).substring(2, 9)

// RESET ESTABLE
function resetForm() {
  form.scope = props.defaults?.scope || 'records'
  form.query = props.defaults?.query || ''
  form.combine = props.defaults?.combine || 'AND'

  form.rules.splice(0)

  if (props.defaults?.rules?.length) {
    props.defaults.rules.forEach(r => {
      // Si es colección y viene vacío, inicializamos array
      const val = r.field === 'collections' ? (Array.isArray(r.value) ? r.value : []) : r.value || ''
      form.rules.push({ ...r, value: val, id: generateId() })
    })
  } else {
    form.rules.push({
      id: generateId(),
      field: null,
      operator: 'contains',
      value: ''
    })
  }
}

watch(() => props.modelValue, val => { if(val) resetForm() })

// OPTIONS
const fieldOptions = computed(() =>
  props.fields?.map(f => typeof f === 'string' ? { title: f, value: f } : f) || []
)

const operatorOptions = [
  { title: 'Contiene', value: 'contains' },
  { title: 'Igual', value: 'eq' },
  { title: 'Vacío', value: 'isEmpty' }
]

// RULES
function addRule() {
  form.rules.push({
    id: generateId(),
    field: null,
    operator: 'contains',
    value: ''
  })
}

function removeRule(idx) {
  form.rules.splice(idx, 1)
  if (!form.rules.length) addRule()
}

// EMIT SEARCH
function emitSearch() {
  const validRules = form.rules.filter(r => r.field && (r.operator === 'isEmpty' || r.value?.length || r.value))
  if (!form.query && !validRules.length) return

  emit('do-advanced-search', {
    scope: form.scope,
    query: form.query,
    combine: form.combine,
    rules: validRules
  })

  open.value = false
}
</script>

<style scoped>
/* =========================================================
   BOTÓN DE ELIMINAR (ACCIÓN DESTRUCTIVA, EDITORIAL)
   ========================================================= */

.delete-btn {
  min-width: 36px !important;
  width: 36px;
  height: 36px;
  padding: 0 !important;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 6px;
  border: 1px solid var(--color-border);

  background: transparent !important;
  cursor: pointer;

  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

/* Hover discreto, no agresivo */
.delete-btn:hover {
  background: rgba(107, 47, 58, 0.08) !important;
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

/* =========================================================
   ICONO
   ========================================================= */

.delete-icon {
  font-size: 18px;
  font-weight: 500;
  line-height: 1;

  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>