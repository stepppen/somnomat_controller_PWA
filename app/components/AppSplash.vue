<template>
  <Transition name="fade">
    <div v-if="showSplash" class="splash-screen">
      <img 
        src="/icons/144_icon.png" 
        alt="Logo" 
        class="splash-logo"
        @error="handleImageError"
      />
      <p v-if="imageError" style="color: white;">Image failed to load</p>
    </div>
  </Transition>
</template>

<script setup>
const showSplash = ref(true)
const imageError = ref(false)

const handleImageError = () => {
  console.error('Image failed to load')
  imageError.value = true
}

onMounted(() => {
  console.log('AppSplash component mounted')
  
  const hasShownSplash = sessionStorage.getItem('hasShownSplash')
  console.log('Has shown splash:', hasShownSplash)
  
  if (hasShownSplash) {
    showSplash.value = false
  } else {
    showSplash.value = true
    sessionStorage.setItem('hasShownSplash', 'true')
    
    setTimeout(() => {
      console.log('Hiding splash screen')
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
  right: 0;
  bottom: 0;
  background-color: #F2F2F2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.splash-logo {
  width: 144px;
  height: 144px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>