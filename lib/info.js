const { Promise } = require('smart-promise')
const Ajv = require('ajv')
const schema = require('@greenlight/schema-plugin')
const spawn = require('@ahmadnassri/spawn-promise')
const SpawnError = require('@ahmadnassri/spawn-promise/lib/error')

// force AJV to be async
schema.$async = true

const ajv = new Ajv()
const validate = ajv.compile(schema)

module.exports = function (image) {
  // docker run args
  const args = [
    'image',
    'inspect',
    '--format="{{json .Config.Labels}}"',
    image
  ]

  return Promise.resolve(spawn('docker', args, { encoding: 'utf-8', shell: true }))
    .then(({ stdout, stderr }) => {
      if (stderr) throw new Error(stderr)
      return JSON.parse(stdout)
    })
    .then(validate)
    .catch(SpawnError, ({ stdout, stderr }) => {
      throw new Error(stderr)
    })
}
