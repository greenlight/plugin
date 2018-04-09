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
    '--format="{{json .ContainerConfig.Labels}}"',
    image
  ]

  return Promise.resolve(spawn('docker', args, { shell: true }))
    .then(stream => stream.stdout)
    .then(JSON.parse)
    .then(validate)
    // catch and release with new name
    .catch(SpawnError, error => {
      throw new Error(error.stderr.toString())
    })
    .catch(Ajv.ValidationError, error => {
      throw new Error(error)
    })
}
