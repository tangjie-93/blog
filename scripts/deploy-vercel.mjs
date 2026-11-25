import { execFileSync } from 'node:child_process'
import { lookup } from 'node:dns'
import { lookup as lookupAsync } from 'node:dns/promises'
import { isIP } from 'node:net'
import { get } from 'node:https'
import { fileURLToPath } from 'node:url'

const apiUrl = process.env.VERCEL_API_URL || 'https://api.vercel.com'

/** Check API connectivity without sending credentials or disabling TLS verification. */
export function probeApi(url, connectHost) {
  return new Promise(resolve => {
    const request = get(new URL('/v2/user', url), {
      ...(connectHost ? { lookup: (_hostname, options, callback) => {
        if (isIP(connectHost)) {
          const address = { address: connectHost, family: isIP(connectHost) }
          callback(null, options.all ? [address] : address.address, address.family)
        } else lookup(connectHost, options, callback)
      } } : {}),
    }, response => {
      response.resume()
      resolve([200, 401, 403].includes(response.statusCode))
    })
    const timeout = setTimeout(() => request.destroy(new Error('API connection timed out')), 8000)
    request.on('error', () => resolve(false))
    request.on('close', () => clearTimeout(timeout))
  })
}

/** Select the alternate connection address only when the default API is unreachable. */
export async function selectConnection(url, probe = probeApi, resolve = lookupAsync, configured = process.env.VERCEL_API_CONNECT_ADDRESS) {
  if (await probe(url)) return undefined
  if (url === 'https://api.vercel.com') {
    const addresses = await resolve('vercel.com', { all: true })
    if (configured && !isIP(configured)) throw new Error('VERCEL_API_CONNECT_ADDRESS must be an IP address.')
    if (configured) addresses.unshift({ address: configured })
    const results = await Promise.all(addresses.map(async ({ address }) =>
      await probe(url, address) ? address : undefined))
    const address = results.find(Boolean)
    if (address) return address
  }
  throw new Error('Cannot reach the Vercel API over HTTPS; check network access before deploying.')
}

/** Deploy with a pinned Node CLI so the process-local DNS fallback is applied consistently. */
export async function deployVercel() {
  const fallback = await selectConnection(apiUrl)
  const env = { ...process.env }
  if (fallback) {
    const preload = fileURLToPath(new URL('./vercel-network.cjs', import.meta.url))
    env.VERCEL_API_CONNECT_ADDRESS = fallback
    env.NODE_OPTIONS = `${env.NODE_OPTIONS || ''} --require=${JSON.stringify(preload)}`.trim()
    console.log('Using Vercel alternate connection address; API hostname and TLS verification are unchanged.')
  }
  const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
  execFileSync(pnpm, ['dlx', 'vercel@50.8.1', '--api', apiUrl, '--prod', '--yes'], {
    stdio: 'inherit', env, shell: pnpm.endsWith('.cmd'),
  })
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await deployVercel()
