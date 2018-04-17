const { Promise } = require('smart-promise')
const spawn = require('@ahmadnassri/spawn-promise')
const SpawnError = require('@ahmadnassri/spawn-promise/lib/error')

module.exports = function (image) {
  const args = [
    'pull',
    image
  ]

  return Promise.resolve(spawn('docker', args, { encoding: 'utf-8' }))
    .then(({ stdout, stderr }) => {
      if (stderr) throw new Error(stderr)
      return stdout.split('\n').find(line => line.match(/^Status:.+/))
    })
    .catch(SpawnError, ({ stdout, stderr }) => {
      throw new Error(stderr)
    })
}
