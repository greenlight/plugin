const { Promise } = require('smart-promise')
const spawn = require('@ahmadnassri/spawn-promise')
const SpawnError = require('@ahmadnassri/spawn-promise/lib/error')

module.exports = function (name, tag = 'latest', registry) {
  name = `${name}:${tag}`

  if (registry) {
    name = `${registry}/${name}`
  }
  const args = [
    'pull',
    name
  ]

  return Promise.resolve(spawn('docker', args, { encoding: 'utf-8' }))
    .then(stream => stream.stdout.trim().split('\n').find(line => line.match(/^Status:.+/)))
    .catch(SpawnError, error => {
      throw new Error(error.stderr.trim())
    })
}
