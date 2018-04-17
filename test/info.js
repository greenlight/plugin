const { test } = require('tap')

const info = require('../lib/info')

const plugin = require('./fixtures/plugin.json')

test('info:valid', async assert => {
  assert.plan(1)

  const found = await info('greenlight/valid')

  assert.same(found, plugin)
})

test('info:invalid', async assert => {
  assert.plan(1)

  assert.rejects(() => info('greenlight/invalid'), { message: 'validation failed' })
})

test('info:fail', assert => {
  assert.plan(1)

  assert.rejects(info('greenlight/foobar'), { message: 'No such image: greenlight/foobar' })
})
