const { encrypter } = require("../adapters/encrypter")
const { HttpError } = require("../HttpError")
const { User } = require("../models/User")

module.exports.authMiddleware = async function (req, res, next) {
  const authHeader = req.headers.authorization
  console.log("afafdads", authHeader)
  if (authHeader && authHeader.indexOf("Bearer ") === 0) {
    const authToken = authHeader.split("Bearer ")[1]
    try {
      const { userId } = await encrypter.verifySign(authToken)

      const authenticatedUser = await User.findById(userId)
      req.user = authenticatedUser
      return next()
    } catch (error) {
      return next(new HttpError(401, "Unauthorized"))
    }
  } else {
    return next(new HttpError(401, "Unauthorized"))
  }
}
