const { HttpError } = require("../HttpError")

module.exports.notAdminMiddleware = async function (req, res, next) {
  const user = req.user
  if (!user) return next(new HttpError(401, "Unauthorized"))
  else if (user.isAdmin) return next(new HttpError(403, "Forbidden"))
  else return next()
}
