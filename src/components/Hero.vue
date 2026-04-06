<template>
  <div
    class="hero"
    :style="{ backgroundImage: `url(${heroImage})` }"
  >
    <div class="hero-overlay">
      <h1>Sitio de Granada</h1>
      <p>Bienvenido al nuevo sitio de Granada.</p>
    </div>
  </div>
</template>

<script setup>
// Importa la imagen 
import heroImage from '@/assets/sitioGranada.jpg'
</script>


<style scoped>
/* =========================================================
   HERO EDITORIAL (PORTADA DE CATÁLOGO)
   ========================================================= */

.hero {
  width: 100%;
  aspect-ratio: 16 / 9;     /* ✅ proporción equilibrada */
  min-height: 180px;
  max-height: 280px;

  background-size: cover;
  background-position: center;

  position: relative;
  overflow: hidden;
  border-radius: 12px;
}

/* =========================================================
   OVERLAY
   ========================================================= */

.hero-overlay {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 32px 28px;

  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.65),
    rgba(0, 0, 0, 0.35),
    transparent
  );
}

/* =========================================================
   TEXTO DEL HERO (AMARILLO ENVEJECIDO CLARO)
   ========================================================= */

.hero.hero .hero-overlay h1 {
  font-family: var(--font-serif);
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  font-weight: 500;
  line-height: 1.2;
  margin-bottom: 6px;

  color: #F6EFD9 !important; /* ✅ amarillo viejo */
}

.hero.hero .hero-overlay p {
  font-family: var(--font-sans);
  font-size: 15px;
  margin: 0;
  max-width: 520px;

  color: rgba(246, 239, 217, 0.85) !important;
}

/* =========================================================
   RESPONSIVE
   ========================================================= */

@media (max-width: 768px) {
  .hero {
    max-height: 220px;
  }

  .hero-overlay {
    padding: 20px 16px;
  }

  .hero.hero .hero-overlay h1 {
    font-size: 1.6rem;
  }

  .hero.hero .hero-overlay p {
    font-size: 13px;
  }
}
</style>
