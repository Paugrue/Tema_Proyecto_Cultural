<template>
  <v-app class="app-wrapper">
    <AppHeader />

    <v-main class="main-content">
      <router-view class="page-view" />
    </v-main>

    <AppFooter />
  </v-app>
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
</script>


<style scoped>
/* CONTENEDOR GENERAL DE LA APP*/

.app-wrapper {
  font-family: var(--font-sans);
  background-color: var(--color-background);
  color: var(--color-text);

  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* CONTENIDO PRINCIPAL */
/* Espaciado editorial, no "UI compacta" */

.main-content {
  flex: 1;
  padding-top: 64px;
  padding-bottom: 96px;
}

/*TRANSICIÓN DE PÁGINA (SUTIL, NO EFECTO APP) */

.page-view {
  opacity: 0;
  animation: fadeInPage 0.45s ease forwards;
}

@keyframes fadeInPage {
  to {
    opacity: 1;
  }
}

/* RESPONSIVE*/

@media (max-width: 768px) {
  .main-content {
    padding-top: 48px;
    padding-bottom: 64px;
  }
}
</style>
