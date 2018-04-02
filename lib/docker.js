const { join, resolve } = require('path')
const { Promise } = require('smart-promise')
const { promisify } = require('util')
const { writeFile } = require('fs')
const Ajv = require('ajv')
const make = require('make-dir')
const pluginSchema = require('@greenlight/schema-plugin')
const reportSchema = require('@greenlight/schema-report')
const spawn = require('@ahmadnassri/spawn-promise')

const ExtendableError = require('@ahmadnassri/error')

class InfoError extends ExtendableError {}
class ReportError extends ExtendableError {}

const hash = require('./hash')

// force AJV to be async
pluginSchema.schema.$async = true
reportSchema.schema.$async = true

const ajv = new Ajv()
const validatePlugin = ajv.compile(pluginSchema.schema)
const validateReport = ajv.compile(reportSchema.schema)

const write = promisify(writeFile)

const runopts = [
  'run',
  '--rm',
  // '--cap-drop', 'all',
  '--log-driver', 'none',
  '--memory-swap', '-1',
  '--memory', '1g',
  '--net', 'none'
  // '--user', '9000:9000'
]

function info (image) {
  // docker run options
  const options = runopts.concat([
    '--name', hash(image),
    image,
    'info'
  ])

  return Promise.resolve(spawn('docker', options, { encoding: 'utf8' }))
    .then(stream => stream.stdout)
    .then(JSON.parse)
    .then(validatePlugin)
    .catch(SyntaxError, Ajv.ValidationError, error => {
      throw new InfoError(error)
    })
}

function run (image, settings = {}, source, tempRoot) {
  const id = hash(image)

  const tempDir = join(tempRoot, id)
  const settingsFile = resolve(join(tempDir, 'settings'))

  // docker run options
  const options = runopts.concat([
    '--volume', `${resolve(source)}:/source:ro`,
    '--volume', `${settingsFile}:/settings.json:ro`,
    '--name', id,
    image,
    'run'
  ])

  // make settings dir
  return Promise.resolve(make(tempDir))
    // store settings
    .then(() => write(settingsFile, JSON.stringify(settings)))
    .then(() => spawn('docker', options, { encoding: 'utf8' }))
    .then(stream => stream.stdout)
    .then(output => {
      write(join(tempDir, 'report'), output)
      return output
    })
    .then(JSON.parse)
    .then(validateReport)
    // catch and release with new name
    .catch(SyntaxError, Ajv.ValidationError, error => {
      throw new ReportError(error)
    })
}

module.exports = {
  info,
  run
}
