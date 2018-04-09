const { createHash } = require('crypto')
const { EventEmitter } = require('events')
const { join, resolve } = require('path')
const { promisify } = require('util')
const { spawn } = require('child_process')
const { writeFile } = require('fs')
const Ajv = require('ajv')
const make = require('make-dir')
const schema = require('@greenlight/schema-report')
const spawnPromise = require('@ahmadnassri/spawn-promise')

const Transform = require('./lib/transform')

const ajv = new Ajv()
const validate = ajv.compile(schema)

const write = promisify(writeFile)

module.exports = class Docker extends EventEmitter {
  constructor (name, tag = 'latest', settings = {}, options = {}) {
    super()

    this.name = name
    this.tag = tag
    this.options = options
    this.settings = settings === true ? {} : settings
  }

  hash (name) {
    return 'greenlight-' + createHash('sha1').update(name).digest('hex')
  }

  async info () {
    const args = [
      'images',
      '--format="{{.Repository}}"',
      '-q', this.name
    ]

    const { stdout, stderr } = await spawnPromise('docker', args, { encoding: 'utf-8', shell: true })

    if (stderr) throw new Error(stderr.trim())

    return stdout.trim()
  }

  async pull () {
    let name = `${this.name}:${this.tag}`

    if (this.options.registry) {
      name = `${this.options.registry}/${this.name}`
    }
    const args = [
      'pull',
      name
    ]

    const { stdout, stderr } = await spawnPromise('docker', args, { encoding: 'utf-8' })

    if (stderr) throw new Error(stderr.trim())

    return stdout.trim().split('\n').find(line => line.match(/^Status:.+/))
  }

  async run (mounts, temp) {
    const id = this.hash(this.name)

    // settings to object

    const path = {
      report: join(temp, id, 'report'),
      errors: join(temp, id, 'errors'),
      settings: resolve(join(temp, id, 'settings'))
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
      '--name', id,
      `${this.name}:${this.tag}`
    ]

    // make output dir
    await make(temp, id)

    // store settings
    await write(path.settings, JSON.stringify(this.settings))

    const child = spawn('docker', args)

    // child.on('error', err => new Error(1, err))

    child.stdout.pipe(new Transform()).on('data', async data => {
      await write(path.report, data)

      const valid = validate(JSON.parse(data))

      if (!valid) {
        this.emit('error:schema', `${validate.errors[0].dataPath} ${validate.errors[0].message}`, validate.errors)
        return
      }

      this.emit('data', data)
    })

    child.stderr.pipe(new Transform()).on('data', async data => {
      await write(path.errors, data)

      this.emit('error:spawn', JSON.parse(data))
    })

    child.on('close', code => this.emit('end', code))
  }
}
