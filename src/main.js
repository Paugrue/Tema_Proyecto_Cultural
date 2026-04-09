import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

/* === ESTILOS EDITORIALES === */
import '@/assets/editorial.css'
import '@mdi/font/css/materialdesignicons.css'

/* === VUETIFY === */
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

/* =========================================================
   VUETIFY – TEMA EDITORIAL
   ========================================================= */

const vuetify = createVuetify({
  components,
  directives,

    icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },

  theme: {
    defaultTheme: 'editorialTheme',
    cssVariables: true,   

    themes: {
      editorialTheme: {
        dark: false,
        colors: {
          background: '#F2E8C9',
          surface: '#FFFFFF',

          primary: '#2F5D50',     
          secondary: '#6B7C76',
          accent: '#9FB8A0',

          error: '#8C2F39',
          info: '#375A7F',
          success: '#3F7366',
          warning: '#C6A85B',
        },
      },
    },
  },

  defaults: {
    global: {
      ripple: false,
    },

    VBtn: {
      elevation: 0,
      rounded: 'sm',
      style: {
        textTransform: 'none',
        fontWeight: '500',
      },
    },

    VCard: {
      elevation: 0,
      rounded: 'md',
    },
  },
})



/* =========================================================
   APP
   ========================================================= */

createApp(App)
  .use(router)
  .use(vuetify)
  .mount('#app')