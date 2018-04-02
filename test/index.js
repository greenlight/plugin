const { test } = require('tap')

const Plugin = require('..')

const info = require('./fixtures/plugins/valid/plugin.json')
const report = require('./fixtures/plugins/valid/report.json')

test('plugin match driver', assert => {
  assert.plan(5)

  const plugin = new Plugin('greenlight/plugin-valid')

  plugin.on('start', () => assert.ok(true))
  plugin.on('info', result => assert.same(info, result))
  // plugin.on('driver:fail', () => {})
  plugin.on('driver:success', driver => assert.ok(true))
  plugin.on('running', () => assert.ok(true))
  plugin.on('end', result => {
    assert.same(result, report)
    assert.end()
  })

  plugin.run('filesystem', '/code', '/tmp')
})

test('plugin no driver match', assert => {
  assert.plan(4)

  const plugin = new Plugin('greenlight/plugin-valid')

  plugin.on('start', () => assert.ok(true))
  plugin.on('info', result => assert.same(info, result))
  plugin.on('driver:fail', () => assert.ok(true))
  plugin.on('end', result => {
    assert.same(result, undefined)
    assert.end()
  })

  plugin.run('not-a-driver', '/code', '/tmp')
})
