export default defineEventHandler((event) => {
  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff')
  setResponseHeader(event, 'X-Frame-Options', 'DENY')
  setResponseHeader(event, 'Referrer-Policy', 'same-origin')
  if (event.path.startsWith('/fonts/')) {
    setResponseHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
  }
})
