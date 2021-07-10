const mongoose = require("mongoose")

// banco de dados em memória para testes
const db = require("../tests/db")
// carregando models
require("../models")
const { HttpError } = require("../HttpError")

const User = mongoose.model("User")
const { UsersController } = require("./UsersController")

// setup/cleanup de banco de testes
beforeAll(async () => await db.connect())
afterEach(async () => await db.clearDatabase())
afterAll(async () => await db.closeDatabase())

describe("UsersController", () => {
  const usersCtrl = new UsersController()

  describe("método register", () => {
    it("retorna o novo usuário inserido no banco de dados", async () => {
      const userInfo1 = {
        name: "marcos",
        birthDate: new Date(1990, 10, 10),
        city: "Rio de Janeiro",
        country: "Brasil",
        password: "1990marcos",
        username: "marcos10"
      }

      const createdUser = await usersCtrl.register(userInfo1)

      expect(createdUser.username).toBe(userInfo1.username)
    })

    it("lança um erro caso o usuário já exista", async () => {
      const userInfo1 = {
        name: "marcos",
        birthDate: new Date(1990, 10, 10),
        city: "Rio de Janeiro",
        country: "Brasil",
        password: "1990marcos",
        username: "marcos10"
      }

      await usersCtrl.register(userInfo1)

      await expect(usersCtrl.register(userInfo1)).rejects.toBeInstanceOf(HttpError)
    })

    it("lança um erro caso não sejam providos dados válidos", async () => {
      const userInfo1 = {}

      await expect(usersCtrl.register(userInfo1)).rejects.toBeInstanceOf(HttpError)
    })
  })

  describe("método updateInfo", () => {
    it("modifica e retorna o usuário atualizado", async () => {
      const userInfo1 = {
        name: "marcos",
        birthDate: new Date(1990, 10, 10),
        city: "Rio de Janeiro",
        country: "Brasil",
        password: "1990marcos",
        username: "marcos10"
      }

      const createdUser = await usersCtrl.register(userInfo1)

      const updateObject = { country: "Argentina", city: "São Paulo" }
      const updatedUser = await usersCtrl.updateInfo(createdUser._id, updateObject)

      expect(updatedUser).toEqual(expect.objectContaining(updateObject))
    })

    it("lança um erro caso o usuário não exista", async () => {
      const updateObject = { country: "Argentina", city: "São Paulo" }

      const inexistentId = "507f1f77bcf86cd799439011"

      await expect(
        usersCtrl.updateInfo(inexistentId, updateObject)
      ).rejects.toBeInstanceOf(HttpError)
    })

    it("lança um erro caso não sejam providos dados válidos", async () => {
      const userInfo1 = {
        name: "marcos",
        birthDate: new Date(1990, 10, 10),
        city: "Rio de Janeiro",
        country: "Brasil",
        password: "1990marcos",
        username: "marcos10"
      }

      const createdUser = await usersCtrl.register(userInfo1)
      const updateObject = { birthDate: "uncastable_to_date" }

      await expect(usersCtrl.updateInfo(createdUser._id, updateObject)).rejects.toBeInstanceOf(HttpError)
    })
  })

  describe("método updatePassword", () => {
    it("modifica a hash da senha", async () => {
      const userInfo1 = {
        name: "marcos",
        birthDate: new Date(1990, 10, 10),
        city: "Rio de Janeiro",
        country: "Brasil",
        password: "1990marcos",
        username: "marcos10"
      }

      const createdUser = await usersCtrl.register(userInfo1)
      await usersCtrl.updatePassword(createdUser._id, "ACCEPTABLE_PASSWORD")
      const userWithPasswordHash = await User.findById(createdUser._id).select("+passwordHash")

      expect(createdUser.passwordHash).not.toEqual(userWithPasswordHash.passwordHash)
    })

    it("lança um erro caso o usuário não exista", async () => {
      const inexistentId = "507f1f77bcf86cd799439011"

      await expect(
        usersCtrl.updatePassword(inexistentId, "IRRELEVANT_PASSWORD")
      ).rejects.toBeInstanceOf(HttpError)
    })

    it("lança um erro caso a nova senha não seja uma string com ao menos 8 caracteres", async () => {
      const userInfo1 = {
        name: "marcos",
        birthDate: new Date(1990, 10, 10),
        city: "Rio de Janeiro",
        country: "Brasil",
        password: "1990marcos",
        username: "marcos10"
      }

      const createdUser = await usersCtrl.register(userInfo1)

      await expect(usersCtrl.updatePassword(createdUser._id, "weakpwd")).rejects.toBeInstanceOf(HttpError)
    })
  })

  describe("método deactivate", () => {
    it("modifica o status do usuário de ativo para inativo", async () => {
      const userInfo1 = {
        name: "marcos",
        birthDate: new Date(1990, 10, 10),
        city: "Rio de Janeiro",
        country: "Brasil",
        password: "1990marcos",
        username: "marcos10"
      }

      const createdUser = await usersCtrl.register(userInfo1)
      const deactivatedUser = await usersCtrl.deactivate(createdUser._id)

      expect(deactivatedUser.active).toBe(false)
    })

    it("lança um erro caso o usuário não exista", async () => {
      const inexistentId = "507f1f77bcf86cd799439011"

      await expect(
        usersCtrl.deactivate(inexistentId)
      ).rejects.toBeInstanceOf(HttpError)
    })

    it("lança um erro caso o usuário já esteja inativo", async () => {
      const userInfo1 = {
        name: "marcos",
        birthDate: new Date(1990, 10, 10),
        city: "Rio de Janeiro",
        country: "Brasil",
        password: "1990marcos",
        username: "marcos10",
        active: false
      }

      const createdUser = await usersCtrl.register(userInfo1)

      await expect(usersCtrl.deactivate(createdUser._id)).rejects.toBeInstanceOf(HttpError)
    })
  })

  describe("método activate", () => {
    it("modifica o status do usuário de ativo para ativo", async () => {
      const userInfo1 = {
        name: "marcos",
        birthDate: new Date(1990, 10, 10),
        city: "Rio de Janeiro",
        country: "Brasil",
        password: "1990marcos",
        username: "marcos10",
        active: false
      }

      const createdUser = await usersCtrl.register(userInfo1)
      const deactivatedUser = await usersCtrl.activate(createdUser._id)

      expect(deactivatedUser.active).toBe(true)
    })

    it("lança um erro caso o usuário não exista", async () => {
      const inexistentId = "507f1f77bcf86cd799439011"

      await expect(
        usersCtrl.activate(inexistentId)
      ).rejects.toBeInstanceOf(HttpError)
    })

    it("lança um erro caso o usuário já esteja ativo", async () => {
      const userInfo1 = {
        name: "marcos",
        birthDate: new Date(1990, 10, 10),
        city: "Rio de Janeiro",
        country: "Brasil",
        password: "1990marcos",
        username: "marcos10",
        active: true
      }

      const createdUser = await usersCtrl.register(userInfo1)

      await expect(usersCtrl.activate(createdUser._id)).rejects.toBeInstanceOf(HttpError)
    })
  })
})
