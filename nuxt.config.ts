export default defineNuxtConfig({
  compatibilityDate: '2026-11-02',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css', '~/assets/css/workspace.css', '~/assets/css/capstone.css'],
  nitro: { externals: { inline: ['xlsx'] } },
  runtimeConfig: { gatewayUrl: 'http://127.0.0.1:8080' },
  routeRules: {
    '/fonts/**': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
  },
  app: {
    head: {
      title: 'Capstone · Teknologi Informasi Udayana',
      htmlAttrs: { lang: 'id' },
      link: [
        { rel: 'preload', href: '/fonts/urbanist-latin.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
      ],
      style: [
        {
          textContent: "@font-face{font-family:Urbanist;src:url('/fonts/urbanist-latin.woff2') format('woff2');font-style:normal;font-weight:100 900;font-display:block;}html{font-family:Urbanist,system-ui,-apple-system,'Segoe UI',sans-serif;}",
        },
      ],
      meta: [{ name: 'description', content: 'Sistem layanan Capstone Project Program Studi Teknologi Informasi Universitas Udayana.' }],
    },
  },
  typescript: { strict: true },
})
