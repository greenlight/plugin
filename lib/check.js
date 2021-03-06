const { Promise } = require('smart-promise')
const spawn = require('@ahmadnassri/spawn-promise')
const SpawnError = require('@ahmadnassri/spawn-promise/lib/error')

module.exports = function (name) {
  const args = [
    'images',
    '--format="{{.Repository}}"',
    '-q', name
  ]

  return Promise.resolve(spawn('docker', args, { encoding: 'utf-8', shell: true }))
    .then(({ stdout, stderr }) => {
      if (stderr) throw new Error(stderr)
      return stdout.length === 0 ? false : stdout
    })
    .catch(SpawnError, ({ stdout, stderr }) => {
      throw new Error(stderr)
    })
}
