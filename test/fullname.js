const { test } = require('tap')

const Docker = require('..')

test('fullname:success', async assert => {
  assert.plan(1)

  const docker = new Docker('greenlight/plugin')

  assert.same(docker.fullname, 'greenlight/plugin')
})

test('fullname:with-registry', async assert => {
  assert.plan(1)

  const docker = new Docker('greenlight/plugin', {}, { registry: 'foobar' })

  assert.same(docker.fullname, 'foobar/greenlight/plugin')
})
