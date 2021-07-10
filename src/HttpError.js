module.exports.HttpError = class extends Error {
  constructor (code = 500, message = "Internal Error", payload) {
    super(message)
    this.code = code
    this.payload = payload
  }
}
