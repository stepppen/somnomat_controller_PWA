<template>
  <div class="splash-screen">
    <img 
      src="/icons/144_icon.png" 
      alt="Logo" 
      class="splash-logo"
    />
  </div>
</template>

<style scoped>
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--primary-contrast);
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