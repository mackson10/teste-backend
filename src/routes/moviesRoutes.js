const express = require("express")

const { MoviesController } = require("../controllers/MoviesController")
const { authMiddleware } = require("../middlewares/authMiddleware")
const { adminMiddleware } = require("../middlewares/adminMiddleware")

const moviesController = new MoviesController()

exports.moviesRoutes = function () {
  const route = express.Router()

  route.post("/",
    authMiddleware,
    adminMiddleware,
    async function (req, res, next) {
      try {
        const newMovie = await moviesController.register(req.body)
        return res.send({ movie: newMovie })
      } catch (error) {
        return next(error)
      }
    })

  route.put("/:movieId",
    authMiddleware,
    adminMiddleware,
    async function (req, res, next) {
      try {
        const updatedMovie = await moviesController
          .updateInfo(req.params.movieId, req.body)
        return res.send({ movie: updatedMovie })
      } catch (error) {
        return next(error)
      }
    })

  route.get("/", async function (req, res, next) {
    try {
      const movieList = await moviesController.list(req.body)
      return res.send({ movies: movieList })
    } catch (error) {
      return next(error)
    }
  })

  route.get("/:movieId", async function (req, res, next) {
    try {
      const movie = await moviesController
        .details(req.params.movieId)
      return res.send({ movie: movie })
    } catch (error) {
      return next(error)
    }
  })

  return route
}
