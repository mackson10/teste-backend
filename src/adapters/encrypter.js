const bcrypt = require("bcrypt")

const salt = 8

class Encrypter {
  constructor (salt) {
    this.salt = salt
  }

  async hash (value) {
    const hash = await bcrypt.hash(value, salt)
    return hash
  }

  async compare (value, hash) {
    return await bcrypt.compare(value, salt)
  }
}

exports.encrypter = new Encrypter(salt)
