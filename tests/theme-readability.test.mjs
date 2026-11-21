import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const css = readFileSync(new URL('../docs/.vitepress/theme/style.css', import.meta.url), 'utf8')
const dark = css.match(/\.dark\s*\{([^}]+)\}/)?.[1] ?? ''
const token = name => dark.match(new RegExp(`${name}:\\s*(#[0-9a-f]{6})\\s*;`, 'i'))?.[1]

function luminance(hex) {
  const rgb = hex.slice(1).match(/../g).map(value => {
    const channel = Number.parseInt(value, 16) / 255
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722
}

function contrast(foreground, background) {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
  return (values[0] + 0.05) / (values[1] + 0.05)
}

test('dark reading text retains the original clear palette on page and card surfaces', () => {
  assert.equal(token('--vp-c-text-2'), '#c4cfdb')
  assert.equal(token('--vp-c-text-3'), '#aab8c7')
  assert.equal(token('--blog-muted'), '#adbdcc')
  for (const text of ['--vp-c-text-1', '--vp-c-text-2', '--vp-c-text-3', '--blog-muted']) {
    for (const surface of ['--vp-c-bg', '--blog-panel']) {
      assert.ok(contrast(token(text), token(surface)) >= 7, `${text} on ${surface} should retain at least 7:1 contrast`)
    }
  }
})

test('mobile sidebar uses an opaque sliding surface instead of fading its text and background', () => {
  const sidebar = css.slice(css.indexOf('.Layout aside.VPSidebar'), css.indexOf('.Layout .VPDoc'))
  assert.match(sidebar, /background-color:\s*var\(--vp-sidebar-bg-color\)/)
  assert.match(sidebar, /max-width:\s*959px/)
  assert.match(sidebar, /opacity:\s*1/)
  assert.match(sidebar, /visibility:\s*hidden/)
  assert.match(sidebar, /&\.open\s*\{\s*visibility:\s*visible/)
  assert.doesNotMatch(sidebar, /transition:\s*opacity/)
})

test('dark accent stays distinct and text uses native font smoothing', () => {
  assert.equal(token('--vp-c-brand-1'), '#58e5cb')
  assert.match(dark, /--blog-selected-text:\s*var\(--vp-c-brand-1\)/)
  assert.match(css, /body\s*\{\s*-webkit-font-smoothing:\s*auto\s*;/)
})
