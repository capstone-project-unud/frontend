export default defineNuxtConfig({
  compatibilityDate: '2026-11-02',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  runtimeConfig: { gatewayUrl: 'http://127.0.0.1:8080' },
  app: {
    head: {
      title: 'Capstone · Teknologi Informasi Udayana',
      htmlAttrs: { lang: 'id' },
      meta: [{ name: 'description', content: 'Sistem layanan Capstone Project Program Studi Teknologi Informasi Universitas Udayana.' }],
    },
  },
  typescript: { strict: true },
})
