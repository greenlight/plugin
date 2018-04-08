const { join, resolve } = require('path')
const { Promise } = require('smart-promise')
const { promisify } = require('util')
const { writeFile } = require('fs')
const Ajv = require('ajv')
const make = require('make-dir')
const schema = require('@greenlight/schema-report')
const spawn = require('@ahmadnassri/spawn-promise')
const SpawnError = require('@ahmadnassri/spawn-promise/lib/error')

const hash = require('./hash')

// force AJV to be async
schema.$async = true

const ajv = new Ajv()
const validate = ajv.compile(schema)

const write = promisify(writeFile)

module.exports = function run (image, settings = {}, mounts, tempRoot) {
  const id = hash(image)

  const tempDir = join(tempRoot, id)
  const settingsFile = resolve(join(tempDir, 'settings'))

  // docker run args
  const args = [
    'run',
    '--rm',
    '--cap-drop', 'all',
    '--log-driver', 'none',
    '--memory-swap', '-1',
    '--memory', '1g',
    '--net', 'none',
    '--volume', `${resolve(mounts)}:/source:ro`,
    '--volume', `${settingsFile}:/settings.json:ro`,
    '--name', id,
    image
  ]

  // make settings dir
  return Promise.resolve(make(tempDir))
    // store settings
    .then(() => write(settingsFile, JSON.stringify(settings)))
    .then(() => spawn('docker', args, { encoding: 'utf-8' }))
    .then(stream => stream.stdout.trim())
    .then(output => {
      write(join(tempDir, 'report'), output)
      return output
    })
    .then(JSON.parse)
    .then(validate)

    // catch and release with new name
    .catch(SpawnError, error => {
      throw new Error(error.stderr.trim())
    })
    .catch(SyntaxError, Ajv.ValidationError, error => {
      throw new Error(error)
    })
}
