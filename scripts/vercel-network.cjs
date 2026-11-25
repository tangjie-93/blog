const dns = require('node:dns')
const { isIP } = require('node:net')

// Opt-in connection fallback: keep the API hostname, HTTP Host and TLS SNI intact.
// Use only an address verified by the deploy runner, without changing system DNS.
const address = process.env.VERCEL_API_CONNECT_ADDRESS
const family = isIP(address || '')
if (family) {
  const lookup = dns.lookup
  dns.lookup = function (hostname, options, callback) {
    if (hostname !== 'api.vercel.com') return lookup.call(dns, hostname, options, callback)
    if (typeof options === 'function') {
      callback = options
      options = {}
    }
    const all = options && typeof options === 'object' && options.all
    process.nextTick(() => callback(null, all ? [{ address, family }] : address, family))
  }
}
