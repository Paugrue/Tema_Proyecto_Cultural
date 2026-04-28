import { createRouter, createWebHistory } from 'vue-router'

import Inicio from '@/pages/Inicio.vue'
import RecordList from '@/pages/RecordList.vue'
import RecordDetail from '@/pages/RecordDetail.vue'
import CollectionList from '@/pages/CollectionList.vue'
import CollectionDetail from '@/pages/CollectionDetail.vue'
import Pages from '@/pages/Pages.vue'

const routes = [
  { path: '/', redirect: '/inicio' },
  { path: '/inicio', name: 'Inicio', component: Inicio },

  // RECORDS
  { path: '/record', name: 'RecordList', component: RecordList },
  { path: '/record/:id', name: 'RecordDetail', component: RecordDetail, props: true },

  // COLLECTIONS
  { path: '/collection', name: 'CollectionList', component: CollectionList },
  { path: '/collection/:id', name: 'CollectionDetail', component: CollectionDetail, props: true },

  // PAGES
  { path: '/pages', name: 'Pages', component: Pages },

  // FAVORITES
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('@/pages/FavoritesView.vue')
  },

  // ✅ SEARCH (redirige correctamente sin usar Search.vue)
  {
    
  path: '/search',
  name: 'Search',
  component: () => import('@/pages/Search.vue')

  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior () {
    return { top: 0, behavior: 'smooth' }
  }
})

export default router
