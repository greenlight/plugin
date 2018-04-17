const { Transform } = require('stream')

module.exports = class extends Transform {
  constructor () {
    super()

    this.stub = ''
  }

  _flush (done) {
    this.push(this.stub)
    done()
  }

  _transform (chunk, encoding, done) {
    const lines = chunk.toString('utf8').split('\0')

    if (lines.length > 1) {
      lines.forEach((line, index) => {
        if (index === 0) {
          // First part, append it to the stub and push it
          this.push(this.stub + line)
          this.stub = ''
        } else if (index === lines.length - 1) {
          // Last part of the chunk, this will be the new stub and the beginning
          // of the next chunk (until delimiter) will be appended to this
          this.stub = line
        } else {
          // This must be a part cleanly separated by the delimiter within the
          // same chunk, push it
          this.push(line)
        }
      })
    } else {
      // No delimiter found, append the chunk to the stub
      this.stub = this.stub + lines[0]
    }

    done()
  }
}
