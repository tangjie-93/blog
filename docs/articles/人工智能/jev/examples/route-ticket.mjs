import assert from 'node:assert/strict'
import { test } from 'node:test'

const teams = ['orders', 'billing', 'other']

// Illustrative policy, not production thresholds. The result is a queue name, not an action.
function route(response) {
  const { team, impact, duplicate_charge: duplicate } = response?.answers ?? {}
  const within = (value, max = 1) => Number.isFinite(value) && value >= 0 && value <= max
  const probability = team?.probabilities?.[team.choice]

  if (team?.type !== 'choice' || !teams.includes(team.choice) || !within(probability) ||
      impact?.type !== 'score' || !within(impact.score, 2) ||
      duplicate?.type !== 'noul' || !within(duplicate.noul)) return 'manual_review'

  if (duplicate.noul > 0.30 || team.choice === 'other' || probability < 0.80) return 'manual_review'
  if (impact.score >= 1.70) return 'priority_review'
  return team.choice
}

function mock({ choice = 'orders', probability = 0.87, score = 0.98, duplicate = 0.08 } = {}) {
  return {
    answers: {
      team: { type: 'choice', choice, probabilities: { [choice]: probability } },
      impact: { type: 'score', score },
      duplicate_charge: { type: 'noul', noul: duplicate },
    },
  }
}

test('付款后没生成订单：进入订单队列', () => {
  assert.equal(route(mock()), 'orders')
})

test('清楚的账单咨询：进入账单队列', () => {
  assert.equal(route(mock({ choice: 'billing' })), 'billing')
})

test('重复扣款或判断不明：进入人工复核', () => {
  assert.equal(route(mock({ choice: 'billing', duplicate: 0.91 })), 'manual_review')
  assert.equal(route(mock({ duplicate: 0.31 })), 'manual_review')
  assert.equal(route(mock({ probability: 0.61 })), 'manual_review')
  assert.equal(route(mock({ choice: 'other' })), 'manual_review')
})

test('广泛影响：进入优先复核，不直接执行', () => {
  assert.equal(route(mock({ score: 1.85 })), 'priority_review')
})

test('无响应、未知选项或字段不合法：回到人工', () => {
  assert.equal(route(undefined), 'manual_review')
  assert.equal(route(mock({ choice: 'refund' })), 'manual_review')
  assert.equal(route(mock({ score: 3 })), 'manual_review')
  assert.equal(route(mock({ duplicate: '0.10' })), 'manual_review')
})
