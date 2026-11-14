import assert from 'node:assert/strict'
import test from 'node:test'
import config from '../docs/.vitepress/config.mts'

test('SSR includes Element popper targets without replacing existing body teleports', async () => {
  const context = {
    teleports: {
      body: '<div>existing</div>',
      '#el-popper-container-1024': '<!--teleport start--><div>options</div><!--teleport end-->',
      '#unrelated': '<div>other</div>',
    },
  }
  await config.postRender(context)
  assert.equal(context.teleports.body, '<div>existing</div><div id="el-popper-container-1024"><!--teleport start--><div>options</div><!--teleport end--></div>')
  assert.doesNotThrow(() => config.postRender({}))
})
