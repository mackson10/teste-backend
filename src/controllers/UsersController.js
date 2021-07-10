const mongoose = require("mongoose")

const { HttpError } = require("../HttpError")
const User = mongoose.model("User")

module.exports.UsersController = class {
  // constructor () {}

  // valida requisição (dados de um novo usuário)
  // valida inexistencia do usuário
  // persiste novo usuário
  async register ({ name, birthDate, city, country, password, username, isAdmin, active }) {
    const userFound = await User.findOne({ username })
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

      return await newUser.save()
    }
  }

  // valida requisição (dados atualizáveis de usuário existente)
  // valida existencia do usuário
  // persiste modificações no usuário logado
  async updateInfo (userId, {
    name,
    birthDate,
    city,
    country
  }) {
    const updateObject = { name, birthDate, city, country }

    let userFound

    if (mongoose.isValidObjectId(userId)) {
      userFound = await User.findById(userId)
    }

    if (!userFound) {
      throw new HttpError(404, "User not found")
    } else if (typeof updateObject !== "object") {
      throw new HttpError(400, "Bad Request")
    } else {
      Object.assign(userFound, updateObject)

      try {
        await userFound.validate()
      } catch (validationErrors) {
        throw new HttpError(400, "Bad request", validationErrors)
      }

      return await userFound.save()
    }
  }

  // valida requisição
  // persiste modificações no usuário logado
  async updatePassword (userId, newPassword) {
    let userFound

    if (mongoose.isValidObjectId(userId)) {
      userFound = await User.findById(userId)
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

  // o usuário deve ser admin
  // valida requisição com usuário alvo como parametro
  // valida existencia do usuario alvo
  // persiste modificação no usuário alvo
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

  // o usuário deve ser admin
  // valida requisição com usuário alvo como parametro
  // valida existencia do usuario alvo
  // persiste modificação no usuário alvo
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
