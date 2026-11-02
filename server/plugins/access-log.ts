export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    const start = process.hrtime.bigint()
    const method = event.method
    const path = event.path.split('?')[0]
    // finish also covers responses sent directly by Nitro's error handler.
    event.node.res.once('finish', () => {
      console.log(JSON.stringify({
        access_log: true,
        service: 'frontend',
        time: new Date().toISOString(),
        status: getResponseStatus(event),
        method,
        path,
        duration: `${(Number(process.hrtime.bigint() - start) / 1_000_000).toFixed(2)}ms`,
      }))
    })
  })
})
