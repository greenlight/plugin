const { test } = require('tap')

const check = require('../lib/check')

test('check success', async assert => {
  assert.plan(1)

  const result = await check('greenlight/valid')

  assert.equal(result, 'greenlight/valid')
})

test('check fail', async assert => {
  assert.plan(1)

  const result = await check('greenlight/foo')

  assert.equal(result, '')
})
