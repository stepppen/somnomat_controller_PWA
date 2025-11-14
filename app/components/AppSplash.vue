<template>
  <div class="splash-screen">
    <p style="color: black; font-size: 24px;">SPLASH SCREEN TEST</p>
    <img 
      src="/icons/144_icon.png" 
      alt="Logo" 
      class="splash-logo"
    />
  </div>
</template>

<script setup>
console.log('=== AppSplash component loaded ===')

onMounted(() => {
  console.log('=== AppSplash mounted ===')
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
}
</style>