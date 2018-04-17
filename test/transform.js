const { test } = require('tap')
const { PassThrough } = require('stream')

const Transform = require('../lib/transform')

test('transform:no-delimiter', assert => {
  assert.plan(1)

  const pass = new PassThrough()

  pass.pipe(new Transform()).on('data', data => {
    assert.equal('foo', data.toString())
  })

  pass.write('foo')
  pass.end()
})

test('transform:delimiter', assert => {
  assert.plan(3) // the key is getting 3 passes

  const pass = new PassThrough()

  pass.pipe(new Transform()).on('data', data => {
    assert.equal(3, data.length) // 3x data entries
  })

  pass.write('foo\0bar\0baz')
  pass.end()
})
