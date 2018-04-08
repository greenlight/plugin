const { test } = require('tap')

const pull = require('../lib/pull')

test('pull success', async assert => {
  assert.plan(1)

  const result = await pull('alpine', 'latest', 'index.docker.io')

  assert.match(result, /Status:.+/)
})

test('pull fail', async assert => {
  assert.plan(1)

  assert.rejects(pull('greenlight/invalid'), { message: 'pull access denied for greenlight/invalid' })
})
