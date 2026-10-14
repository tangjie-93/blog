import assert from 'node:assert/strict'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'
import { createCommentDocument } from '../docs/.vitepress/theme/comments.ts'

/** 在隔离文档中模拟脚本加载与浏览器尺寸通知，不请求真实评论服务。 */
function createFrameFixture(failInitialization = false) {
  const html = createCommentDocument('/waline.js', '/waline.css', '/blog/test.html', '文章', { serverURL: 'https://comments.example.com' })
  const frameElement = { style: {} }
  const message = { textContent: '正在加载评论…', remove() { this.removed = true } }
  const scripts = []
  const listeners = {}
  let height = 100
  let resize
  let disconnected = false
  let destroyed = false
  let options
  const visitor = { dataset: {} }
  const body = { getBoundingClientRect: () => ({ height }) }
  const cards = []
  const browser = { fetch: async () => browser.response }
  let updateMetadata
  runInNewContext(html.match(/<script>([\s\S]*?)<\/script>/)[1], {
    frameElement,
    window: browser,
    URL,
    document: {
      body,
      head: { appendChild: script => scripts.push(script) },
      querySelector: () => visitor,
      querySelectorAll: () => cards,
      getElementById: id => id === 'message' ? message : {},
      createElement: () => ({}),
    },
    ResizeObserver: class {
      constructor(callback) { resize = callback }
      observe(element) { assert.equal(element, body); resize() }
      disconnect() { disconnected = true }
    },
    MutationObserver: class {
      constructor(callback) { updateMetadata = callback }
      observe() {}
      disconnect() {}
    },
    addEventListener: (event, callback) => { listeners[event] = callback },
    Waline: { init(config) {
      if (failInitialization) throw new Error('initialization failed')
      options = config
      return { destroy() { destroyed = true } }
    } },
  })
  return {
    frameElement, message, scripts, listeners, visitor, browser, cards,
    updateMetadata() { updateMetadata() },
    get options() { return options },
    get destroyed() { return destroyed },
    get disconnected() { return disconnected },
    resizeTo(value) { height = value; resize() },
  }
}

test('comment frame fits loading content, expands and shrinks after content changes', () => {
  const frame = createFrameFixture()
  assert.equal(frame.frameElement.style.height, '102px')
  frame.scripts[0].onload()
  frame.scripts[1].onload()
  assert.equal(frame.message.removed, true)
  for (const [height, expected] of [[480.4, '483px'], [1100, '1102px'], [360, '362px']]) {
    frame.resizeTo(height)
    assert.equal(frame.frameElement.style.height, expected)
  }
  frame.listeners.pagehide()
  assert.equal(frame.disconnected, true)
  assert.equal(frame.destroyed, true)
})

test('comment script loading errors keep a visible compact error message', () => {
  for (const failedScript of [0, 1]) {
    const frame = createFrameFixture()
    if (failedScript === 1) frame.scripts[0].onload()
    frame.scripts[failedScript].onerror()
    frame.resizeTo(88)
    assert.equal(frame.message.textContent, '评论暂时无法加载，请刷新页面重试。')
    assert.equal(frame.message.removed, undefined)
    assert.equal(frame.frameElement.style.height, '90px')
  }
})

test('comment initialization failures retain the error state and resize normally', () => {
  const frame = createFrameFixture(true)
  frame.scripts[0].onload()
  frame.scripts[1].onload()
  frame.resizeTo(112)
  assert.equal(frame.message.textContent, '评论暂时无法加载，请刷新页面重试。')
  assert.equal(frame.message.removed, undefined)
  assert.equal(frame.frameElement.style.height, '114px')
})

test('Waline uses the migrated path, two optional fields and its server notification flow', () => {
  const frame = createFrameFixture()
  assert.equal(frame.scripts[0].href, '/waline.css')
  frame.scripts[0].onload()
  assert.equal(frame.scripts[1].src, '/waline.js')
  frame.scripts[1].onload()
  assert.equal(frame.options.serverURL, 'https://comments.example.com')
  assert.equal(frame.options.path, '/blog/test.html')
  assert.equal(frame.visitor.dataset.path, '/blog/test.html')
  assert.equal(frame.options.pageview, true)
  assert.equal(frame.options.dark, 'html[data-theme="dark"]')
  assert.deepEqual(Array.from(frame.options.meta), ['nick', 'mail'])
  assert.deepEqual(Array.from(frame.options.requiredMeta), [])
  assert.equal(frame.options.login, 'disable')
})

test('comment metadata uses exact Beijing time and authenticated roles, including late-rendered replies', async () => {
  const frame = createFrameFixture()
  function card(id) {
    const nodes = {}
    const head = { querySelector: selector => selector.startsWith('.comment-') ? nodes[selector] : { after: node => { nodes['.' + node.className] = node } } }
    return { id, nodes, querySelector: () => head }
  }
  frame.browser.response = { ok: true, url: 'https://comments.example.com/api/comment', clone: () => ({ json: async () => ({ data: { data: [
    { objectId: 1, time: Date.parse('2026-10-14T15:33:57Z'), nick: 'james', type: 'guest', children: [
      { objectId: 2, time: Date.parse('2026-10-14T16:00:01Z'), type: 'administrator' },
    ] },
  ] } }) }) }
  const original = frame.browser.response
  assert.equal(await frame.browser.fetch('/api/comment'), original)
  await new Promise(resolve => setImmediate(resolve))
  const guest = card('1'), admin = card('2')
  frame.cards.push(guest, admin)
  frame.updateMetadata()
  assert.equal(guest.nodes['.comment-date'].textContent, '2026-10-14 23:33:57')
  assert.equal(guest.nodes['.comment-author'], undefined)
  assert.equal(admin.nodes['.comment-date'].textContent, '2026-10-15 00:00:01')
  assert.equal(admin.nodes['.comment-author'].textContent, '博主')
  const date = admin.nodes['.comment-date']
  frame.updateMetadata()
  assert.equal(admin.nodes['.comment-date'], date)
})
