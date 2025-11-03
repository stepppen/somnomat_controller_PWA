import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  css: ['./app/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  modules: ['nuxt-mdi', '@vite-pwa/nuxt'],
  pwa: {
    manifest: {
      name: "Calmea",
      short_name: "Calmea",
      description: "PWA Nuxt Prototype",
      icons: [{
        src: "icons/144_icon.png",
        sizes: "144x144",
        type: "image/png"
      }]
    },
    workbox: {
      navigateFallback: "/",
    },
    devOptions: {
      enabled: true,
      type: "module",
    },
  }
})