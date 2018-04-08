const spawn = require('@ahmadnassri/spawn-promise')

module.exports = function (name) {
  const args = [
    'images',
    '--format="{{.Repository}}"',
    '-q', name
  ]

  return spawn('docker', args, { encoding: 'utf-8', shell: true })
    .then(stream => stream.stdout.trim())
}
