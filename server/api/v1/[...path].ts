export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const origin = getHeader(event, 'origin')
  const requestURL = getRequestURL(event)
  if ((origin && origin !== requestURL.origin) || getHeader(event, 'sec-fetch-site') === 'cross-site') {
    throw createError({ statusCode: 403, statusMessage: 'Origin tidak diizinkan.' })
  }
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const target = `${config.gatewayUrl}${event.path}`
  // The gateway is reachable only through this same-origin BFF in production.
  return proxyRequest(event, target, {
    headers: { origin: requestURL.origin, 'x-client-ip': getRequestIP(event) || 'unknown', 'x-service-token': '', 'x-forwarded-for': '', 'x-forwarded-host': '' },
  })
})
