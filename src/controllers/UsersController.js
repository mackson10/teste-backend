const mongoose = require("mongoose")

const { HttpError } = require("../HttpError")
const { encrypter } = require("../adapters/encrypter")

const User = mongoose.model("User")

module.exports.UsersController = class {
  // constructor () {}

  async authenticate (username, password) {
    console.log(username, password)
    const userFound = await User.findOne({ username, active: true })
    if (!userFound || !await userFound.comparePassword(password)) {
      throw new HttpError(400, "Invalid Credentials")
    } else {
      return await encrypter.sign({ userId: userFound._id })
    }
  }

  async register ({ name, birthDate, city, country, password, username, isAdmin, active }) {
    const userFound = await User.findOne({ username, active: true })
    if (userFound) {
      throw new HttpError(400, "User already registered")
    } else {
      const newUser = new User({
        name,
        birthDate,
        city,
        country,
        active,
        username,
        isAdmin
      })

      if (typeof password === "string" && password.length >= 8) {
        newUser.passwordHash = await newUser.hashPassword(password)
      } else {
        throw new HttpError(400, "Bad Request")
      }

      try {
        await newUser.validate()
      } catch (validationErrors) {
        throw new HttpError(400, "Bad request", validationErrors)
      }
      const userObj = (await newUser.save()).toObject()
      delete userObj.passwordHash
      return userObj
    }
  }

  async updateInfo (userId, {
    name,
    birthDate,
    city,
    country
  }) {
    const updateObject = { name, birthDate, city, country }

    let userFound

    if (mongoose.isValidObjectId(userId)) {
      userFound = await User.findOne({ _id: userId, active: true })
    }

    if (!userFound) {
      throw new HttpError(404, "User not found")
    } else if (typeof updateObject !== "object") {
      throw new HttpError(400, "Bad Request")
    } else {
      for (const key in updateObject) {
        if (updateObject[key]) {
          userFound[key] = updateObject[key]
        }
      }

      try {
        await userFound.validate()
      } catch (validationErrors) {
        throw new HttpError(400, "Bad request", validationErrors)
      }

      return await userFound.save()
    }
  }

  async updatePassword (userId, newPassword) {
    let userFound

    if (mongoose.isValidObjectId(userId)) {
      userFound = await User.findOne({ _id: userId, active: true })
    }

    if (!userFound) {
      throw new HttpError(404, "User not found")
    } else if (typeof newPassword === "string" && newPassword.length >= 8) {
      userFound.passwordHash = await userFound.hashPassword(newPassword)
      return await userFound.save()
    } else {
      throw new HttpError(400, "Bad Request")
    }
  }

  async deactivate (userId) {
    let userFound

    if (mongoose.isValidObjectId(userId)) {
      userFound = await User.findById(userId)
    }

    if (!userFound) {
      throw new HttpError(404, "User not found")
    } else if (userFound.active) {
      userFound.active = false
      return await userFound.save()
    } else {
      throw new HttpError(400, "User already inactive")
    }
  }

  async activate (userId) {
    let userFound

    if (mongoose.isValidObjectId(userId)) {
      userFound = await User.findById(userId)
    }

    if (!userFound) {
      throw new HttpError(404, "User not found")
    } else if (!userFound.active) {
      userFound.active = true
      return await userFound.save()
    } else {
      throw new HttpError(400, "User already active")
    }
  }
}
