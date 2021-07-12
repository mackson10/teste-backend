const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const salt = 8
const secret = "random_string"

class Encrypter {
  constructor (salt) {
    this.salt = salt
  }

  async hash (value) {
    return await bcrypt.hash(secret + value, salt)
  }

  async compare (value, hash) {
    return await bcrypt.compare(secret + value, hash)
  }

  async sign (object) {
    return new Promise((resolve, reject) => {
      jwt.sign(object, secret, function (error, encoded) {
        if (error) return reject(error)
        else return resolve(encoded)
      })
    })
  }

  async verifySign (token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, function (error, decoded) {
        if (error) return reject(error)
        else return resolve(decoded)
      })
    })
  }
}

exports.encrypter = new Encrypter(salt)
