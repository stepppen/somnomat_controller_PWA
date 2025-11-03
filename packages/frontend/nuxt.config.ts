import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineNuxtConfig({
  rootDir: __dirname,
  buildDir: resolve(__dirname, '.nuxt'), // Explicitly set buildDir
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
      display: 'standalone',
      background_color: '#ebe4e0',
      theme_color: '#ebe4e0',
      description: "PWA Nuxt Prototype",
      icons: [{
        src: "/icons/144_icon.png", // Leading slash
        sizes: "144x144",
        type: "image/png"
      }]
    },
    workbox: {
      navigateFallback: "/",
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: true,
      type: "module",
    },
  }
})