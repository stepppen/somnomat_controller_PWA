<template>
  <div class="h-screen overflow-hidden">
    <div class="p-4">
      <AppHeader />

    </div>
    <slot />
    <div class="fixed flex justify-center w-full bottom-0 p-4">
      <TabBar />
    </div>
  </div>
</template>