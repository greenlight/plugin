const { test } = require('tap')

const Docker = require('..')

const fixture = require('./fixtures/report.json')

test('run:success', assert => {
  assert.plan(6)

  const docker = new Docker('greenlight/valid')

  docker.on('data', data => assert.match(data, fixture))
  docker.on('end', code => assert.equal(0, code))

  docker.run('/code')
})

test('run:invalid', assert => {
  assert.plan(2)

  const docker = new Docker('greenlight/invalid')

  docker.on('error:schema', error => assert.match(error, /should NOT have additional properties/))
  docker.on('end', code => assert.equal(0, code))

  docker.run('/code')
})

test('run:fail', assert => {
  assert.plan(2)

  const docker = new Docker('greenlight/foobar')

  docker.on('error:stderr', error => assert.match(error, /Unable to find image 'greenlight\/foobar:latest' locally/))
  docker.on('end', code => assert.equal(125, code))

  docker.run('/code')
})
