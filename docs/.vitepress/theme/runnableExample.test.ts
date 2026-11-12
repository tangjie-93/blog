import assert from 'node:assert/strict'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'
import { createExampleDocument } from './runnableExample.ts'

test('example output captures early and asynchronous logs, errors and text without rendering HTML', () => {
    const source = '<!doctype html><html><head><title>Demo</title></head><body><script>console.log("example")</script></body></html>'
    const html = createExampleDocument(source)
    assert.ok(html.startsWith('<!doctype html><html><head><script>'))
    assert.ok(html.endsWith('<title>Demo</title></head><body><script>console.log("example")</script></body></html>'))
    const listeners = new Map()
    const output = { textContent: '', hidden: true, style: { cssText: '' }, setAttribute() {} }
    const appended: unknown[] = []
    const context = {
        console: { log() {}, info() {}, warn() {}, error() {} },
        window: { addEventListener(name: string, handler: unknown) { listeners.set(name, handler) } },
        document: { createElement() { return output }, body: { appendChild(node: unknown) { appended.push(node) } } },
    }
    const script = html.match(/<script>([\s\S]*?)<\/script>/)![1]
    runInNewContext(script + '\nconsole.log("<img src=x>", { count: 2 });', context)
    assert.equal(appended.length, 0)
    listeners.get('DOMContentLoaded')()
    assert.equal(output.textContent, '<img src=x> {"count":2}')
    assert.equal(output.hidden, false)
    runInNewContext('console.warn("later"); const circular = {}; circular.self = circular; console.log(circular);', context)
    listeners.get('error')({ message: 'example failed' })
    listeners.get('unhandledrejection')({ reason: 'rejected' })
    assert.match(output.textContent, /\[warn\] later\n\[object Object\]\n\[error\] example failed\n\[error\] rejected$/)
    runInNewContext('for (let i = 0; i < 210; i++) console.log(i);', context)
    assert.equal(output.textContent.split('\n').length, 200)
    assert.equal(output.textContent.split('\n')[0], '10')
})

test('a visual example keeps the output panel hidden until something is logged', () => {
    const html = createExampleDocument('<html><head></head><body><canvas></canvas></body></html>')
    const listeners = new Map()
    const output = { hidden: false, textContent: '', style: {}, setAttribute() {} }
    runInNewContext(html.match(/<script>([\s\S]*?)<\/script>/)![1], {
        console: { log() {}, info() {}, warn() {}, error() {} },
        window: { addEventListener(name: string, handler: unknown) { listeners.set(name, handler) } },
        document: { createElement() { return output }, body: { appendChild() {} } },
    })
    listeners.get('DOMContentLoaded')()
    assert.equal(output.hidden, true)
})
