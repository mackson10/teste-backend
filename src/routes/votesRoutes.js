const express = require("express")

const { HttpError } = require("../HttpError")
const { authMiddleware } = require("../middlewares/authMiddleware")
const { notAdminMiddleware } = require("../middlewares/notAdminMiddleware")
const { MoviesController } = require("../controllers/MoviesController")

const moviesController = new MoviesController()

exports.votesRoutes = function () {
  const route = express.Router()

  route.post("/",
    authMiddleware,
    notAdminMiddleware,
    async function (req, res, next) {
      const { movieId, userId, value } = req.body
      try {
        if (req.user._id.toString() !== userId) throw new HttpError(403, "Forbidden")
        const newVote = await moviesController.vote(movieId, userId, value)
        return res.send(newVote)
      } catch (error) {
        return next(error)
      }
    })

  return route
}
