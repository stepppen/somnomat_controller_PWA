import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  
  css: ['./app/assets/css/main.css'],
  
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001'
    }
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  modules: ['nuxt-mdi', '@vite-pwa/nuxt'],
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: "Calmea",
      short_name: "Calmea",
      description: "PWA Nuxt Prototype",
      theme_color: "#ebe4e0",
      background_color: "#ebe4e0",
      display: "standalone",
      scope: "/",
      start_url: "/",
      icons: [
        {
          src: "/icons/144_icon.png",
          sizes: "144x144",
          type: "image/png",
          purpose: "any maskable"
        }
      ]
    },
    workbox: {
      navigateFallback: "/"
    },
    devOptions: {
      enabled: true,
      type: "module",
    },
  }
})