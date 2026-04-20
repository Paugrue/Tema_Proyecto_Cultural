import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api-proxy/api/glam',
  timeout: 10000,
  headers: {
    Accept: 'application/json'
  }
})

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
        fields: [
          'id',
          'title',
          'description',
          'thumbnail',
          'preview',

          // MEDIA 
          'media_items',
          'media_items.attachment',

          // METADATOS
          'metadata_fields',
          'canonical_joined_metadata',
          'joined_metadata',
      

          // opcional pero útil
          'collections',
          'collections_titles'
        ].join(','),
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
        ...params,
      },
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

          // 🔥 METADATOS
          'metadata_fields',
          'canonical_joined_metadata',
          'joined_metadata',

          // RELACIONES
          'children',
          'media_items'
        ].join(','),

        ...params,
      },
    })
  },

  getCollectionsBasic(limit = 100, offset = 0) {
    return apiClient.get('/collection', {
      params: { fields: 'id,title', limit, offset },
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
        fields: 'thumbnail,id,title,description,attachment.id,attachment',
        limit: 24,
        offset: 0,
        ...params,
      },
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
  },
}