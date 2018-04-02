const { join, resolve } = require('path')
const { promisify } = require('util')
const { writeFile } = require('fs')
const Ajv = require('ajv')
const make = require('make-dir')
const pluginSchema = require('@greenlight/schema-plugin')
const reportSchema = require('@greenlight/schema-report')
const spawn = require('@ahmadnassri/spawn-promise')

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

  return spawn('docker', options, { encoding: 'utf8' })
    .then(stream => stream.stdout)
    .then(JSON.parse)
    .then(validatePlugin)
}

function run (image, settings = {}, source, temp) {
  const id = hash(image)

  const settingsPath = join(temp, id)
  const settingsFile = resolve(join(settingsPath, 'settings'))

  // docker run options
  const options = runopts.concat([
    '--volume', `${resolve(source)}:/source:ro`,
    '--volume', `${settingsFile}:/settings.json:ro`,
    '--name', id,
    image,
    'run'
  ])

  // make settings dir
  return make(settingsPath)
    // store settings
    .then(() => write(settingsFile, JSON.stringify(settings)))
    .then(() => spawn('docker', options, { encoding: 'utf8' }))
    .then(stream => stream.stdout)
    .then(JSON.parse)
    .then(validateReport)
}

module.exports = {
  info,
  run
}
