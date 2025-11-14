<template>
  <Transition name="fade">
    <div v-if="showSplash" class="splash-screen">
      <img src="/icons/pwa-512x512.png" alt="Logo" class="splash-logo" />
    </div>
  </Transition>
</template>

<script setup>
const showSplash = ref(false)

onMounted(() => {
  const hasShownSplash = sessionStorage.getItem('hasShownSplash')
  
  if (!hasShownSplash) {
    showSplash.value = true
    sessionStorage.setItem('hasShownSplash', 'true')
    
    setTimeout(() => {
      showSplash.value = false
    }, 3000)
  }
})
</script>

<style scoped>
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh; 
  background: var(--primary-contrast);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.splash-logo {
  width: 192px;
  height: 192px;
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-leave-to {
  opacity: 0;
}
</style>