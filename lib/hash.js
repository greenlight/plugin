const { createHash } = require('crypto')

module.exports = (name) => {
  return 'greenlight-' + createHash('sha1').update(name).digest('hex')
}
