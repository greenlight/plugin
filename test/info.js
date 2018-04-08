const { test } = require('tap')

const info = require('../lib/info')

const plugin = require('./fixtures/plugin.json')

test('valid info', async assert => {
  assert.plan(1)

  const result = await info('greenlight/valid')

  assert.same(result, plugin)
})

test('invalid info', async assert => {
  assert.plan(1)

  assert.rejects(info('greenlight/invalid'), { message: 'validation failed' })
})
