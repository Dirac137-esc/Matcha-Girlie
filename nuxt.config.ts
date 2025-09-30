// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,

  typescript: {
    shim: false
  },

  build: {
    transpile: ["vuetify"],
  },
    css: ['@/scss/style.scss'],
  vite: {
    define: {
      "process.env.DEBUG": false,
    },
  },

  nitro: {
    serveStatic: true,
  },
    public: {
        base_url: process.env.BASE_URL,

    },
  devServerHandlers: [],

  hooks: {
  },

  compatibilityDate: "2025-04-15",
})