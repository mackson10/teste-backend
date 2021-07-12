
module.exports.errorMiddleware = async function (error, req, res, next) {
  return res.status(error.code || error.statusCode || 500).send({
    message: error.message,
    payload: error.payload
  })
}
