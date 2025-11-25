<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<!-- <script setup>
const colorMode = useColorMode()

// Force light mode immediately
colorMode.preference = 'light'
colorMode.value = 'light'

onMounted(() => {
  // Remove dark class if it exists
  document.documentElement.classList.remove('dark')
  document.documentElement.setAttribute('data-color-mode', 'light')
  document.documentElement.style.colorScheme = 'light only'
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
:root {
  color-scheme: light only !important;
}

html.dark {
  color-scheme: light only !important;
}
</style> -->