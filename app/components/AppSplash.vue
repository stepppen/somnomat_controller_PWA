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
const showSplash = ref(false)
const imageError = ref(false)

const handleImageError = () => {
  console.error('Image failed to load')
  imageError.value = true
}

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