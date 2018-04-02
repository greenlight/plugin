const EventEmitter = require('events')

const { info, run } = require('./lib/docker')

module.exports = class extends EventEmitter {
  constructor (image, settings) {
    super()

    this.image = image
    this.settings = settings
  }

  run (driver, source, temp) {
    this.emit('start')

    return info(this.image)
      .then(info => [info, this.emit('info', info)])
      .then(([info]) => {
        if (!info.drivers.hasOwnProperty(driver) || info.drivers[driver] === false) {
          this.emit('driver:fail')
          return
        }

        this.emit('driver:success', info.drivers[driver])

        this.emit('running')

        return run(this.image, this.settings, source, temp)
      })

      .then(result => this.emit('end', result))
  }
}
