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
    includeAssets: ['icons/144_icon.png'],
    manifest: {
      name: "Calmea",
      short_name: "Calmea",
      start_url: '/',
      display: 'standalone',
      background_color: '#ebe4e0',
      theme_color: '#ebe4e0',
      description: "PWA Nuxt Prototype",
      icons: [{
        src: "/icons/144_icon.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "any maskable"
      }]
    },
    workbox: {
      navigateFallback: "/",
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
    },
    // Disable auto icon generation
    devOptions: {
      enabled: false,
      type: "module",
    },
  }
})