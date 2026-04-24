import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api-proxy/api/glam',
  timeout: 10000,
  headers: {
    Accept: 'application/json'
  }
})

const MEDIA_FIELDS =
  'media_items,media_items.id,media_items.title,media_items.mimetype,media_items.thumbnail,media_items.preview,media_items.full,media_items.attachment'

const RECORD_FIELDS = [
  'id',
  'title',
  'description',
  'thumbnail',
  'preview',

  // MEDIA (ESTABLE)
  MEDIA_FIELDS,

  // METADATOS
  'metadata_fields',
  'canonical_joined_metadata',
  'joined_metadata',

  // RELACIONES
  'collections',
  'collections_titles'
].join(',')

export default {
  // =========================
  // RECORDS
  // =========================

  getRecords(params = {}) {
    return apiClient.get('/record', { params })
  },

  getRecord(id, params = {}) {
    return apiClient.get(`/record/${id}`, {
      params: {
        with_labels: 1,
        with_thumbnails: 1,
        fields: RECORD_FIELDS,
        ...params
      }
    })
  },

  getRecordById(id, params = {}) {
    return apiClient.get(`/record/${id}`, { params })
  },

  getRecordsWithFields(params = {}) {
    return apiClient.get('/record', { params })
  },

  searchRecords(params = {}) {
    return apiClient.get('/record', { params })
  },

  searchRecordsAllLang(params = {}) {
    return apiClient.get('/record', { params })
  },

  getRecordsGroupedByCollectionTitle(params = {}) {
    return apiClient.get('/record', {
      params: {
        with_labels: 1,
        group_by: 'collection_title',
        limit: 1000,
        offset: 0,
        ...params
      }
    })
  },

  // =========================
  // COLLECTIONS
  // =========================

  getCollections(params = {}) {
    return apiClient.get('/collection', { params })
  },

  getCollection(id, params = {}) {
    return apiClient.get(`/collection/${id}`, {
      params: {
        with_labels: 1,
        with_thumbnails: 1,
        fields: [
          'id',
          'title',
          'description',
          'thumbnail',

          'metadata_fields',
          'canonical_joined_metadata',
          'joined_metadata',

          'children',
          'media_items'
        ].join(','),

        ...params
      }
    })
  },

  getCollectionsBasic(limit = 100, offset = 0) {
    return apiClient.get('/collection', {
      params: { fields: 'id,title', limit, offset }
    })
  },

  // =========================
  // MEDIA
  // =========================

  getMedia(params = {}) {
    return apiClient.get('/media', { params })
  },

  getMediaDefault(params = {}) {
    return apiClient.get('/media', {
      params: {
        with_labels: 1,
        search_all_languages: 1,
        fields:
          'id,title,description,thumbnail,preview,full,attachment,mimetype',
        limit: 24,
        offset: 0,
        ...params
      }
    })
  },

  getMediaById(id, params = {}) {
    return apiClient.get(`/media/${id}`, { params })
  },

  // =========================
  // ONTOLOGY
  // =========================

  getOntology(params = {}) {
    return apiClient.get('/ontology', { params })
  },

  getOntologyFieldList(params = {}) {
    return apiClient.get('/ontology', { params })
  }
}