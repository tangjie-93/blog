import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { runInNewContext } from 'node:vm'
import { isIP } from 'node:net'
import test from 'node:test'
import { selectConnection } from '../scripts/deploy-vercel.mjs'

const preload = readFileSync(new URL('../scripts/vercel-network.cjs', import.meta.url), 'utf8')
const resolve = async () => [{ address: '192.0.2.1' }, { address: '192.0.2.2' }]

test('Vercel uses the direct API when reachable without resolving alternate addresses', async () => {
  const calls = []
  assert.equal(await selectConnection('https://api.vercel.com', async (...args) => {
    calls.push(args)
    return true
  }, () => { throw new Error('Unexpected lookup') }), undefined)
  assert.deepEqual(calls, [['https://api.vercel.com']])
})

test('Vercel fallback selects a verified address without changing the API URL', async () => {
  const calls = []
  assert.equal(await selectConnection('https://api.vercel.com', async (...args) => {
    calls.push(args)
    return args[1] === '192.0.2.2'
  }, resolve), '192.0.2.2')
  assert.deepEqual(calls, [['https://api.vercel.com'], ['https://api.vercel.com', '192.0.2.1'], ['https://api.vercel.com', '192.0.2.2']])
})

test('Vercel refuses deployment when neither route is reachable or a custom endpoint fails', async () => {
  await assert.rejects(selectConnection('https://api.vercel.com', async () => false, resolve), /Cannot reach/)
  const calls = []
  await assert.rejects(selectConnection('https://custom.example', async (...args) => {
    calls.push(args)
    return false
  }, resolve), /Cannot reach/)
  assert.deepEqual(calls, [['https://custom.example']])
})

test('Vercel network preload is opt-in, preserves callback forms and leaves other hosts alone', async () => {
  for (const enabled of [false, true]) {
    const calls = []
    const dns = { lookup: (...args) => calls.push(args) }
    const original = dns.lookup
    runInNewContext(preload, {
      require: name => name === 'node:dns' ? dns : { isIP },
      process: { env: enabled ? { VERCEL_API_CONNECT_ADDRESS: '192.0.2.1' } : {}, nextTick: process.nextTick },
    })
    const options = { all: true }
    const callback = () => {}
    dns.lookup('example.com', options, callback)
    assert.equal(calls[0][0], 'example.com')
    assert.strictEqual(calls[0][1], options)
    assert.strictEqual(calls[0][2], callback)
    if (enabled) {
      const addresses = await new Promise((resolve, reject) => dns.lookup('api.vercel.com', options, (error, values) => error ? reject(error) : resolve(values)))
      assert.equal(addresses[0].address, '192.0.2.1')
      assert.equal(addresses[0].family, 4)
      const address = await new Promise((resolve, reject) => dns.lookup('api.vercel.com', (error, value) => error ? reject(error) : resolve(value)))
      assert.equal(address, '192.0.2.1')
    } else assert.strictEqual(dns.lookup, original)
  }
})

test('deploy commands share the Vercel runner and do not claim GitHub success prematurely', () => {
  const require = createRequire(import.meta.url)
  assert.equal(require('../package.json').scripts['deploy:vercel'], 'node scripts/deploy-vercel.mjs')
  const source = readFileSync(new URL('../scripts/deploy-all.mjs', import.meta.url), 'utf8')
  assert.match(source, /await deployVercel\(\)/)
  assert.ok(source.indexOf("run(pnpm, ['test'])") < source.indexOf("run(pnpm, ['run', 'build'])"))
  assert.match(source, /GitHub Pages is managed separately/)
})
