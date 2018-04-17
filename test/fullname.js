const { test } = require('tap')

const Docker = require('..')

test('fullname:success', async assert => {
  assert.plan(1)

  const docker = new Docker('greenlight/plugin')

  assert.same(docker.fullname, 'greenlight/plugin:latest')
})

test('fullname:with-tag', async assert => {
  assert.plan(1)

  const docker = new Docker('greenlight/plugin', '4.0')

  assert.same(docker.fullname, 'greenlight/plugin:4.0')
})

test('fullname:with-registry', async assert => {
  assert.plan(1)

  const docker = new Docker('greenlight/plugin', '4.0', {}, { registry: 'foobar' })

  assert.same(docker.fullname, 'foobar/greenlight/plugin:4.0')
})
