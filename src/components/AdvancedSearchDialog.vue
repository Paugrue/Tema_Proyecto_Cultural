<template>
  <v-dialog v-model="open" max-width="920" persistent>
    <v-card class="pa-6" elevation="10" rounded="xl" color="surface">

      <v-card-title class="text-h5 d-flex align-center pb-4">
        <v-icon icon="mdi-magnify-plus" class="me-3" color="primary" />
        Búsqueda Avanzada
      </v-card-title>

      <v-card-text class="pa-0">

        <!-- Alcance -->
        <div class="mb-6">
          <div class="text-subtitle-2 mb-2 text-primary font-weight-bold">
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

        <!-- Término general -->
        <v-text-field
          v-model="form.query"
          label="Término general"
          variant="outlined"
          class="mb-6"
          clearable
          prepend-inner-icon="mdi-text-search"
          @keyup.enter="emitSearch"
        />

        <!-- Filtros específicos -->
        <v-card variant="flat" border class="pa-4 mb-6" color="secondary">

          <div class="d-flex align-center mb-4 flex-wrap">
            <span class="text-subtitle-1 font-weight-bold me-4">
              Filtros específicos
            </span>
            <v-btn-toggle
              v-model="form.combine"
              density="compact"
              mandatory
              color="primary"
            >
              <v-btn value="AND">Y</v-btn>
              <v-btn value="OR">O</v-btn>
            </v-btn-toggle>
          </div>

          <div class="d-flex flex-column ga-4">
            <div
              v-for="(rule, idx) in form.rules"
              :key="rule.id"
              class="d-flex align-center ga-2 flex-wrap"
            >
              <v-select
                v-model="rule.field"
                :items="fieldOptions"
                label="Campo"
                variant="outlined"
                density="compact"
                hide-details
                class="flex-grow-1"
                min-width="150px"
              />

              <v-select
                v-model="rule.operator"
                :items="getOperatorOptions(rule.field)"
                label="Op."
                variant="outlined"
                density="compact"
                style="max-width: 120px"
                hide-details
              />

              <!-- Valor -->
              <v-select
                v-if="rule.field === 'collection_id'"
                v-model="rule.value"
                :items="collectionSelectOptions"
                label="Colección"
                variant="outlined"
                density="compact"
                hide-details
                class="flex-grow-1"
                min-width="200px"
                item-title="title"
                item-value="id"
              />

              <v-text-field
                v-else-if="!['isEmpty', 'notEmpty'].includes(rule.operator)"
                v-model="rule.value"
                label="Valor"
                variant="outlined"
                density="compact"
                hide-details
                class="flex-grow-1"
                min-width="200px"
                @keyup.enter="emitSearch"
              />

                 <v-btn
                icon="mdi-close"
                variant="text"
                density="compact"
                size="small"
                color="error"
                @click="removeRule(idx)"
                :disabled="form.rules.length <= 1"
              />
            </div>

            <v-btn
              variant="text"
              color="primary"
              @click="addRule"
              class="align-self-start"
            >
              + Añadir filtro
            </v-btn>
          </div>
        </v-card>
      </v-card-text>

      <v-card-actions class="px-0 pt-4">
        <v-btn variant="text" color="primary" @click="open = false">
          Cancelar
        </v-btn>
        <v-spacer />
        <v-btn color="primary" variant="flat" @click="emitSearch">
          <v-icon start>mdi-magnify</v-icon>
          Buscar ahora
        </v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'

/* ─────────────────────────────────────────────
   Props y eventos (sin tipos)
───────────────────────────────────────────── */

const props = defineProps({
  modelValue: Boolean,
  fields: { type: Array, default: () => [] },
  collections: { type: Array, default: () => [] },
  defaults: { type: Object, default: () => ({}) }
})

const emit = defineEmits([
  'update:modelValue',
  'do-advanced-search'
])

/* ─────────────────────────────────────────────
   Control del diálogo
───────────────────────────────────────────── */

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})

/* ─────────────────────────────────────────────
   Estado del formulario
───────────────────────────────────────────── */

const form = reactive({
  scope: 'records',
  query: '',
  combine: 'AND',
  rules: []
})

const generateId = () =>
  Math.random().toString(36).substring(2, 9)

/* ─────────────────────────────────────────────
   Reset del formulario
───────────────────────────────────────────── */

function resetForm() {
  form.scope = props.defaults.scope || 'records'
  form.query = props.defaults.query || ''
  form.combine = props.defaults.combine || 'AND'
  form.rules = []

  if (props.defaults.rules?.length) {
    props.defaults.rules.forEach(r => {
      form.rules.push({
        id: generateId(),
        field: r.field ?? null,
        operator: r.operator || 'contains',
        value: r.value ?? ''
      })
    })
  } else {
    addRule()
  }
}

watch(
  () => props.modelValue,
  val => { if (val) resetForm() },
  { immediate: true }
)

/* ─────────────────────────────────────────────
   Opciones de campos y operadores
───────────────────────────────────────────── */

const fieldOptions = computed(() => {
  const defaults = [
    { title: 'Título', value: 'title' },
    { title: 'Descripción', value: 'description' },
    { title: 'Creador', value: 'creator' },
    { title: 'Fecha', value: 'date' },
    { title: 'Tipo', value: 'type' },
    { title: 'Colección', value: 'collection_id' },
    { title: 'Registro', value: 'record_id' }
  ]

  return props.fields.length
    ? props.fields.map(f =>
        typeof f === 'string' ? { title: f, value: f } : f
      )
    : defaults
})

function getOperatorOptions(field) {
  if (field === 'collection_id') {
    return [
      { title: 'Es igual a', value: 'eq' },
      { title: 'Vacío', value: 'isEmpty' },
      { title: 'No vacío', value: 'notEmpty' }
    ]
  }

  if (field === 'record_id') {
    return [
      { title: 'Es igual a', value: 'eq' },
      { title: 'Contiene', value: 'contains' }
    ]
  }

  // default
  return [
    { title: 'Contiene', value: 'contains' },
    { title: 'Es igual a', value: 'eq' },
    { title: 'Empieza con', value: 'startsWith' },
    { title: 'Vacío', value: 'isEmpty' },
    { title: 'No vacío', value: 'notEmpty' }
  ]
}

const collectionSelectOptions = computed(() =>
  props.collections.map(c => ({
    id: c.id,
    title: c.title
  }))
)

/* ─────────────────────────────────────────────
   Gestión de reglas
───────────────────────────────────────────── */

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

/* ─────────────────────────────────────────────
   Emitir búsqueda avanzada
───────────────────────────────────────────── */

function emitSearch() {
  const validRules = form.rules.filter(r => {
    if (!r.field) return false
    if (['isEmpty', 'notEmpty'].includes(r.operator)) return true
    return String(r.value).trim() !== ''
  })

  emit('do-advanced-search', {
    scope: form.scope,
    query: form.query,
    combine: form.combine,
    rules: validRules.map(({ id, ...r }) => r)
  })

  open.value = false
}
</script>

<style scoped>



/* Ajustes de espaciado para los inputs */
:deep(.v-btn-toggle) {
  border: 1px solid rgba(0,0,0,0.12);
}
</style>