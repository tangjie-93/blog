import assert from 'node:assert/strict'
import { test } from 'node:test'
import { onRequestPost } from '../functions/api/comment-notify.ts'

const env = { RESEND_API_KEY: 're_test', COMMENT_NOTIFY_FROM: 'Blog <notify@example.com>', COMMENT_NOTIFY_ORIGIN: 'https://example.com' }

test('comment notification validates origin and forwards a safe email payload', async () => {
  const originalFetch = globalThis.fetch
  let request
  globalThis.fetch = async (...args) => {
    request = args
    return new Response(null, { status: 200 })
  }
  try {
    const response = await onRequestPost({
      env,
      request: new Request('https://example.com/api/comment-notify', {
        method: 'POST',
        headers: { Origin: env.COMMENT_NOTIFY_ORIGIN, 'Content-Type': 'application/json' },
        body: JSON.stringify({ nick: '<小明>', mail: 'x@example.com', comment: '第一行\n第二行', url: '/blog/a.html' }),
      }),
    })
    assert.equal(response.status, 204)
    const body = JSON.parse(request[1].body)
    assert.equal(body.to[0], '1490934761@qq.com')
    assert.match(body.html, /&lt;小明&gt;/)
    assert.match(body.html, /第一行<br>第二行/)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('comment notification rejects requests from another origin', async () => {
  const response = await onRequestPost({
    env,
    request: new Request('https://example.com/api/comment-notify', { method: 'POST', headers: { Origin: 'https://evil.example' }, body: '{}' }),
  })
  assert.equal(response.status, 403)
})
