import assert from 'node:assert/strict'
import test from 'node:test'
import { fitPageSize } from './pageFit.ts'

test('fit page size fills the widest whole number of cards that fits the viewport', () => {
    assert.deepEqual(fitPageSize(1440, 900, 300, 180, 16, 16), { columns: 4, rows: 4, pageSize: 16, rowHeight: 213 })
    assert.deepEqual(fitPageSize(1920, 1080, 300, 180, 16, 16), { columns: 6, rows: 5, pageSize: 30, rowHeight: 203 })
})

test('list mode stays single-column and paginates using complete row heights', () => {
    const fit = fitPageSize(1600, 700, Number.MAX_SAFE_INTEGER, 80, 6, 6, 84)
    assert.equal(fit.columns, 1)
    assert.equal(fit.rows, 8)
    assert.equal(fit.pageSize, 8)
    assert.ok(fit.rowHeight >= 80 && fit.rowHeight <= 84)
    assert.ok(fit.rowHeight * fit.rows + (fit.rows - 1) * 6 <= 700)
})

test('fit page size never drops below a single card and ignores negative space', () => {
    assert.deepEqual(fitPageSize(0, 0, 300, 180, 16, 16), { columns: 1, rows: 1, pageSize: 1, rowHeight: 0 })
    assert.deepEqual(fitPageSize(-20, -40, 300, 180, -8, -8), { columns: 1, rows: 1, pageSize: 1, rowHeight: 0 })
})

test('compact grids cap card height instead of stretching sparse rows', () => {
    assert.equal(fitPageSize(1200, 330, 300, 176, 12, 12, 196).rowHeight, 196)
    const fit = fitPageSize(1600, 700, 300, 176, 12, 12, 196)
    assert.equal(fit.pageSize, 15)
    assert.equal(fit.rowHeight, 196)
    assert.ok(fit.rowHeight * fit.rows + (fit.rows - 1) * 12 <= 700)
    assert.equal(fitPageSize(350, 110, 280, 176, 10, 10, 196).rowHeight, 110)
})

test('fit page size shares leftover height across rows instead of stretching one row', () => {
    const { rows, rowHeight } = fitPageSize(1200, 640, 280, 170, 12, 12)
    assert.equal(rows, 3)
    assert.ok(rowHeight * rows + (rows - 1) * 12 <= 640)
    assert.ok(rowHeight >= 170)
})
