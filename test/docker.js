const { test } = require('tap')

const { info, run } = require('../lib/docker')

const valid = {
  plugin: require('./fixtures/plugins/valid/plugin.json'),
  report: require('./fixtures/plugins/valid/report.json')
}

test('valid info', async assert => {
  assert.plan(1)

  const result = await info('greenlight/plugin-valid')

  assert.same(result, valid.plugin)
})

test('valid run', async assert => {
  assert.plan(1)

  const result = await run('greenlight/plugin-valid', {}, '/code', '/tmp')

  assert.same(result, valid.report)
})

test('invalid info', async assert => {
  assert.plan(1)

  assert.rejects(info('greenlight/plugin-invalid'), { message: 'validation failed' })
})

test('invalid run', async assert => {
  assert.plan(1)

  assert.rejects(run('greenlight/plugin-invalid', undefined, '/code', '/tmp'), { message: 'Unexpected token' })
})
