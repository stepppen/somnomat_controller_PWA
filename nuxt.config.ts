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
      start_url: '/',
      scope: '/',
      display: 'standalone',
      background_color: '#ebe4e0',
      theme_color: '#ebe4e0',
      description: "PWA Nuxt Prototype",
      icons: [
        {
          src: "/icons/144_icon.png",
          sizes: "144x144",
          type: "image/png",
          purpose: "any"
        },
        {
          src: "/icons/144_icon.png",
          sizes: "144x144",
          type: "image/png",
          purpose: "maskable"
        }
      ]
    },
    workbox: {
      additionalManifestEntries: [
        { url: '/', revision: Date.now().toString() }
      ],
      navigateFallback: "/",
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 20
    },
    devOptions: {
      enabled: false,
      type: "module",
    },
  }
})