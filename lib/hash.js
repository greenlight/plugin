const { createHash } = require('crypto')

module.exports = function (name) {
  return createHash('sha1').update(name).digest('hex')
}
