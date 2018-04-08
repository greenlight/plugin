const { test } = require('tap')

const run = require('../lib/run')

const report = require('./fixtures/report.json')

test('valid run', async assert => {
  assert.plan(1)

  const result = await run('greenlight/valid', undefined, '/code', '/tmp')

  assert.same(result, report)
})

test('invalid run', assert => {
  assert.plan(1)

  assert.rejects(run('greenlight/invalid', {}, '/code', '/tmp'), { message: 'Unexpected token' })
})

test('SpawnError', assert => {
  assert.plan(1)

  assert.rejects(run('greenlight/foobar', {}, '/code', '/tmp'), 'SpawnError')
})
