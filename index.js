const { EventEmitter } = require('events')
const { join, resolve } = require('path')
const { promisify } = require('util')
const { spawn } = require('child_process')
const Ajv = require('ajv')
const fs = require('fs')
const make = require('make-dir')
const sanitize = require('sanitize-filename')
const schema = require('@greenlight/schema-report')

const check = require('./lib/check')
const info = require('./lib/info')
const pull = require('./lib/pull')
const Transform = require('./lib/transform')

const ajv = new Ajv()
const validate = ajv.compile(schema)

const append = promisify(fs.appendFile)
const close = promisify(fs.close)
const open = promisify(fs.open)
const write = promisify(fs.writeFile)
const touch = filename => open(filename, 'w').then(close)

const DEBUG = !!+process.env.GREENLIGHT_DEBUG

module.exports = class Docker extends EventEmitter {
  constructor (name, settings = {}, options = {}) {
    super()

    this.name = name
    this.options = options
    this.settings = settings === true ? {} : settings

    this.fullname = this.name

    if (this.options.registry) {
      this.fullname = `${this.options.registry}/${this.fullname}`
    }
  }

  check () {
    return check(this.fullname)
  }

  info () {
    return info(this.fullname)
  }

  pull () {
    return pull(this.fullname)
  }

  async run (mounts, temp = '/tmp/greenlight/') {
    // paths
    const name = sanitize(this.fullname, { replacement: '-' })

    const path = {
      report: join(temp, name, 'report'),
      errors: join(temp, name, 'errors'),
      settings: resolve(join(temp, name, 'settings'))
    }

    // docker run args
    const args = [
      'run',
      '--rm',
      '--cap-drop', 'all',
      '--log-driver', 'none',
      '--memory-swap', '-1',
      '--memory', '1g',
      '--net', 'none',
      '--volume', `${path.settings}:/settings.json:ro`,
      '--volume', `${resolve(mounts)}:/source:ro`,
      '--name', name,
      this.fullname
    ]

    // make output dir
    await make(join(temp, name))

    // store settings
    await write(path.settings, JSON.stringify(this.settings))

    const child = spawn('docker', args)

    // open & reset files
    if (DEBUG) {
      await touch(path.report)
      await touch(path.errors)
    }

    child.stdout.pipe(new Transform()).on('data', async data => {
      if (DEBUG) await append(path.report, data + '\n')

      data = JSON.parse(data)

      const valid = validate(data)

      if (!valid) {
        this.emit('error:schema', `${validate.errors[0].dataPath} ${validate.errors[0].message}`, validate.errors)
        return
      }

      this.emit('data', data)
    })

    child.stderr.pipe(new Transform()).on('data', async data => {
      if (DEBUG) await append(path.errors, data + '\n')

      this.emit('error:stderr', data.toString())
    })

    child.on('close', code => this.emit('end', code))
  }
}
