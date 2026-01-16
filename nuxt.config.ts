import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  imports: {
    autoImport: true
  },
  
  css: ['./app/assets/css/main.css'],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE
    }
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  modules: ['nuxt-mdi', '@vite-pwa/nuxt', '@nuxt/icon', '@nuxt/fonts', '@nuxtjs/google-fonts', '@nuxt/ui'],
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: "Calmea",
      short_name: "Calmea",
      description: "PWA Nuxt Prototype",
      theme_color: "#F2F2F2",
      background_color: "#F2F2F2",
      icons: [
        {
          src: "/icons/144_icon.png",
          sizes: "144x144",
          type: "image/png",
        },
        {
          src: '/icons/pwa-64x64.png',
          sizes: '64x64',
          type: 'image/png'
        },
        {
          src: '/icons/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icons/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icons/maskable-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
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
  },
  googleFonts: {
    families: {
      Poppins: [300, 400, 500],
      Montserrat: [300, 400, 500, 600]
    }
  },
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/png', sizes: '64x64', href: '/icons/pwa-64x64.png' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/icons/pwa-192x192.png' },
        { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/icons/pwa-512x512.png' },
        { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon-180x180.png' }
      ],
      meta: [
        { 
          name: 'viewport', 
          content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover' 
        },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }
      ],
      htmlAttrs: {
        class: 'light'
      }
    }
  },
  ui: {
    colorMode: false
  }
})