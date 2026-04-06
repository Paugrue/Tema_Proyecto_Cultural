<template>
  <PageLayout>
    <div class="page-header">
      <h1 class="page-title">Páginas</h1>
      <p class="page-subtitle">
        Explora las diferentes secciones y contenidos de nuestro archivo cultural.
      </p>
    </div>

    <div class="page-content">
      <slot />
    </div>
  </PageLayout>
</template>

<script setup>
import PageLayout from "@/components/PageLayout.vue"
</script>

<style scoped>
/* =========================================================
   ENCABEZADO DE PÁGINA (EDITORIAL)
   ========================================================= */

.page-header {
  max-width: 720px;
  margin: 0 auto 56px auto;
  text-align: center;
}

/* =========================================================
   TÍTULO DE PÁGINA
   ========================================================= */

.page-title {
  font-family: var(--font-serif);
  font-size: clamp(2.6rem, 5vw, 3.4rem);
  font-weight: 500;
  letter-spacing: -0.3px;
  color: var(--color-heading);
  margin-bottom: 20px;
}

/* =========================================================
   SUBTÍTULO / INTRODUCCIÓN
   ========================================================= */

.page-subtitle {
  font-family: var(--font-sans);
  font-size: 17px;
  color: rgba(30, 30, 30, 0.72);
  line-height: 1.7;
  max-width: 620px;
  margin: 0 auto;
}

/* =========================================================
   CONTENIDO GENERAL DE LA PÁGINA
   ========================================================= */

.page-content {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 24px;
}

/* =========================================================
   RESPONSIVE
   ========================================================= */

@media (max-width: 768px) {
  .page-header {
    margin-bottom: 40px;
  }

  .page-title {
    font-size: 2.2rem;
  }

  .page-content {
    padding: 0 20px;
  }
}
</style>