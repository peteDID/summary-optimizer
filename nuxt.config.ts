export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss'
  ],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  compatibilityDate: '2024-11-07'
})