const { test } = require('tap')

const Docker = require('..')

test('pull success', async assert => {
  assert.plan(1)

  const docker = new Docker('alpine', 'latest', {}, { registry: 'index.docker.io' })

  const result = docker.pull()

  assert.match(result, /Status:.+/)
})

// test('pull fail', async assert => {
//   assert.plan(1)

//   assert.rejects(pull('greenlight/invalid'), { message: 'pull access denied for greenlight/invalid' })
// })
