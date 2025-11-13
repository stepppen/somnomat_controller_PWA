<template>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
<script>
export default {
  mounted() {
    document.addEventListener('gesturestart', function (e) {
      e.preventDefault();
    });
  }
}
</script>