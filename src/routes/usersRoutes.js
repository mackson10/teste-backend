const express = require("express")

const { HttpError } = require("../HttpError")
const { UsersController } = require("../controllers/UsersController")
const { authMiddleware } = require("../middlewares/authMiddleware")
const { adminMiddleware } = require("../middlewares/adminMiddleware")

const usersController = new UsersController()

exports.usersRoutes = function () {
  const route = express.Router()

  route.post("/", async function (req, res, next) {
    try {
      const newUser = await usersController.register(req.body)
      return res.status(201).send({ user: newUser })
    } catch (error) {
      return next(error)
    }
  })

  route.post("/authenticate", async function (req, res, next) {
    try {
      const newAuthToken = await usersController.authenticate(req.body.username, req.body.password)
      return res.send({ token: newAuthToken })
    } catch (error) {
      return next(error)
    }
  })

  route.put("/:userId",
    authMiddleware,
    async function (req, res, next) {
      try {
        if (!req.user.isAdmin && req.user._id.toString() !== req.params.userId) throw new HttpError(403, "Forbidden")
        const updatedUser = await usersController.updateInfo(req.params.userId, req.body)
        return res.send({ user: updatedUser })
      } catch (error) {
        return next(error)
      }
    })

  route.put("/:userId/password",
    authMiddleware,
    async function (req, res, next) {
      try {
        if (!req.user.isAdmin && req.user._id.toString() !== req.params.userId) throw new HttpError(403, "Forbidden")
        const updatedUser = await usersController.updatePassword(req.params.userId, req.body.newPassword)
        return res.send({ user: updatedUser })
      } catch (error) {
        return next(error)
      }
    })

  route.put("/:userId/deactivate",
    authMiddleware,
    adminMiddleware,
    async function (req, res, next) {
      try {
        const deactivatedUser = await usersController.deactivate(req.params.userId)
        return res.send({ user: deactivatedUser })
      } catch (error) {
        return next(error)
      }
    })

  route.put("/:userId/activate",
    authMiddleware,
    adminMiddleware,
    async function (req, res, next) {
      try {
        const activatedUser = await usersController.activate(req.params.userId)
        return res.send({ user: activatedUser })
      } catch (error) {
        return next(error)
      }
    })

  return route
}
