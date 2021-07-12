const mongoose = require("mongoose")

// banco de dados em memória para testes
const db = require("../tests/db")
// carregando models
require("../models")
const { HttpError } = require("../HttpError")

// const User = mongoose.model("User")
const Vote = mongoose.model("Vote")

const { MoviesController } = require("./MoviesController")
const { UsersController } = require("./UsersController")

// setup/cleanup de banco de testes
beforeAll(async () => await db.connect())
afterEach(async () => await db.clearDatabase())
afterAll(async () => await db.closeDatabase())

describe("MoviesController", () => {
  const moviesCtrl = new MoviesController()
  const usersCtrl = new UsersController()

  describe("método register", () => {
    it("retorna o novo filme inserido no banco de dados", async () => {
      const movieInfo1 = {
        title: "Filme Exemplo",
        releaseDate: new Date(2020, 10, 10),
        description: "Lorem Ipsum Dolor Sit Amet",
        director: "Diretor Exemplo",
        genre: "Ação",
        casting: [
          { name: "Angelina Jolie", role: "Mary" },
          { name: "Brad Pitt", role: "Maria" }
        ]
      }

      const createdMovie = await moviesCtrl.register(movieInfo1)

      expect(createdMovie.title).toBe(movieInfo1.title)
    })

    it("lança um erro caso o filme já esteja registrado", async () => {
      const movieInfo1 = {
        title: "Filme Exemplo",
        releaseDate: new Date(2020, 10, 10),
        description: "Lorem Ipsum Dolor Sit Amet",
        director: "Diretor Exemplo",
        genre: "Ação",
        casting: [
          { name: "Angelina Jolie", role: "Mary" },
          { name: "Brad Pitt", role: "Maria" }
        ]
      }
      await moviesCtrl.register(movieInfo1)

      await expect(moviesCtrl.register(movieInfo1)).rejects.toBeInstanceOf(HttpError)
    })

    it("lança um erro caso não sejam providos dados válidos", async () => {
      const movieInfo1 = {}

      await expect(moviesCtrl.register(movieInfo1)).rejects.toBeInstanceOf(HttpError)
    })
  })

  describe("método updateInfo", () => {
    it("modifica e retorna o filme atualizado", async () => {
      const movieInfo1 = {
        title: "Filme Exemplo",
        releaseDate: new Date(2020, 10, 10),
        description: "Lorem Ipsum Dolor Sit Amet",
        director: "Diretor Exemplo",
        genre: "Ação",
        casting: [
          { name: "Angelina Jolie", role: "Mary" },
          { name: "Brad Pitt", role: "Maria" }
        ]
      }

      const createdMovie = await moviesCtrl.register(movieInfo1)

      const updateObject = { releaseDate: new Date(), genre: "Drama" }
      const updatedMovie = await moviesCtrl.updateInfo(createdMovie._id, updateObject)

      expect(updatedMovie).toEqual(expect.objectContaining(updateObject))
    })

    it("lança um erro caso o filme não exista", async () => {
      const updateObject = { releaseDate: new Date(), genre: "Drama" }

      const inexistentId = "507f1f77bcf86cd799439011"

      await expect(
        moviesCtrl.updateInfo(inexistentId, updateObject)
      ).rejects.toBeInstanceOf(HttpError)
    })

    it("lança um erro caso não sejam providos dados válidos", async () => {
      const movieInfo1 = {
        title: "Filme Exemplo",
        releaseDate: new Date(2020, 10, 10),
        description: "Lorem Ipsum Dolor Sit Amet",
        director: "Diretor Exemplo",
        genre: "Ação",
        casting: [
          { name: "Angelina Jolie", role: "Mary" },
          { name: "Brad Pitt", role: "Maria" }
        ]
      }

      const createdMovie = await moviesCtrl.register(movieInfo1)
      const updateObject = { releaseDate: "uncastable_to_date" }

      await expect(moviesCtrl.updateInfo(createdMovie._id, updateObject)).rejects.toBeInstanceOf(HttpError)
    })
  })

  describe("método vote", () => {
    it("persiste um voto de um usuario ao filme", async () => {
      const movieInfo1 = {
        title: "Filme Exemplo",
        releaseDate: new Date(2020, 10, 10),
        description: "Lorem Ipsum Dolor Sit Amet",
        director: "Diretor Exemplo",
        genre: "Ação",
        casting: [
          { name: "Angelina Jolie", role: "Mary" },
          { name: "Brad Pitt", role: "Maria" }
        ]
      }
      const userInfo1 = {
        name: "marcos",
        birthDate: new Date(1990, 10, 10),
        city: "Rio de Janeiro",
        country: "Brasil",
        password: "1990marcos",
        username: "marcos10"
      }

      const createdMovie = await moviesCtrl.register(movieInfo1)
      const createdUser = await usersCtrl.register(userInfo1)

      await moviesCtrl.vote(createdMovie._id, createdUser._id, 3)
      const votes = await Vote
        .find({ movie: createdMovie._id, user: createdUser._id, value: 3 })
      expect(votes.length).toBe(1)
    })

    it("lança um erro caso o filme não exista", async () => {
      const userInfo1 = {
        name: "marcos",
        birthDate: new Date(1990, 10, 10),
        city: "Rio de Janeiro",
        country: "Brasil",
        password: "1990marcos",
        username: "marcos10"
      }

      const createdUser = await usersCtrl.register(userInfo1)

      const inexistentId = "507f1f77bcf86cd799439011"

      await expect(
        moviesCtrl.vote(inexistentId, createdUser._id, 3)
      ).rejects.toBeInstanceOf(HttpError)
    })

    it("lança um erro caso o usuario não exista", async () => {
      const movieInfo1 = {
        title: "Filme Exemplo",
        releaseDate: new Date(2020, 10, 10),
        description: "Lorem Ipsum Dolor Sit Amet",
        director: "Diretor Exemplo",
        genre: "Ação",
        casting: [
          { name: "Angelina Jolie", role: "Mary" },
          { name: "Brad Pitt", role: "Maria" }
        ]
      }

      const createdMovie = await moviesCtrl.register(movieInfo1)

      const inexistentId = "507f1f77bcf86cd799439011"

      await expect(
        moviesCtrl.vote(createdMovie._id, inexistentId, 3)
      ).rejects.toBeInstanceOf(HttpError)
    })

    it("lança um erro caso o valor do voto não seja um numero entre 0 e 4", async () => {
      const movieInfo1 = {
        title: "Filme Exemplo",
        releaseDate: new Date(2020, 10, 10),
        description: "Lorem Ipsum Dolor Sit Amet",
        director: "Diretor Exemplo",
        genre: "Ação",
        casting: [
          { name: "Angelina Jolie", role: "Mary" },
          { name: "Brad Pitt", role: "Maria" }
        ]
      }
      const userInfo1 = {
        name: "marcos",
        birthDate: new Date(1990, 10, 10),
        city: "Rio de Janeiro",
        country: "Brasil",
        password: "1990marcos",
        username: "marcos10"
      }

      const createdMovie = await moviesCtrl.register(movieInfo1)
      const createdUser = await usersCtrl.register(userInfo1)

      await expect(moviesCtrl.vote(createdMovie._id, createdUser._id, 10)).rejects.toBeInstanceOf(HttpError)
    })
  })

  describe("método list", () => {
    it("retorna uma lista de filmes com os campos title, releaseDate e director", async () => {
      const movieInfo1 = {
        title: "Filme Exemplo",
        releaseDate: new Date(2020, 10, 10),
        description: "Lorem Ipsum Dolor Sit Amet",
        director: "Diretor Exemplo",
        genre: "Ação",
        casting: [
          { name: "Angelina Jolie", role: "Mary" },
          { name: "Brad Pitt", role: "Maria" }
        ]
      }
      const movieInfo2 = {
        title: "O filme 2",
        releaseDate: new Date(2010, 10, 10),
        description: "Lorem Ipsum Dolor Sit Amet",
        director: "João Silva",
        genre: "Drama",
        casting: [
          { name: "Mariana", role: "Ana" }
        ]
      }

      await moviesCtrl.register(movieInfo1)
      await moviesCtrl.register(movieInfo2)

      const movieList = await moviesCtrl.list()
      expect(movieList.length).toBe(2)
      movieList.forEach(
        (m) => {
          expect(m.title).not.toBeUndefined()
          expect(m.releaseDate).not.toBeUndefined()
          expect(m.director).not.toBeUndefined()
        }
      )
    })

    it("retorna uma lista de filmes filtrada pelos campos title, director, genre e casting", async () => {
      const movieInfo1 = {
        title: "Filme Exemplo",
        releaseDate: new Date(2020, 10, 10),
        description: "Lorem Ipsum Dolor Sit Amet",
        director: "Diretor Exemplo",
        genre: "Ação",
        casting: [
          { name: "Angelina Jolie", role: "Mary" },
          { name: "Brad Pitt", role: "Maria" }
        ]
      }
      const movieInfo2 = {
        title: "O filme 2",
        releaseDate: new Date(2010, 10, 10),
        description: "Lorem Ipsum Dolor Sit Amet",
        director: "João Silva",
        genre: "Ação",
        casting: [
          { name: "Mariana", role: "Ana" }
        ]
      }

      await moviesCtrl.register(movieInfo1)
      await moviesCtrl.register(movieInfo2)

      const movieList1 = await moviesCtrl.list({ title: "O filme 2" })
      expect(movieList1.length).toBe(1)
      expect(movieList1[0].title).toBe("O filme 2")

      const movieList2 = await moviesCtrl.list({
        genre: "Ação",
        castingNames: ["Angelina Jolie", "Brad Pitt"]

      })
      expect(movieList2.length).toBe(1)
      expect(movieList2[0].title).toBe("Filme Exemplo")

      const movieList3 = await moviesCtrl.list({
        genre: "Ação"
      })
      expect(movieList3.length).toBe(2)
    })
  })

  describe("método details", () => {
    it("retorna o filme com a media dos votos", async () => {
      const movieInfo1 = {
        title: "Filme Exemplo",
        releaseDate: new Date(2020, 10, 10),
        description: "Lorem Ipsum Dolor Sit Amet",
        director: "Diretor Exemplo",
        genre: "Ação",
        casting: [
          { name: "Angelina Jolie", role: "Mary" },
          { name: "Brad Pitt", role: "Maria" }
        ]
      }
      const userInfo1 = {
        name: "marcos",
        birthDate: new Date(1990, 10, 10),
        city: "Rio de Janeiro",
        country: "Brasil",
        password: "1990marcos",
        username: "marcos10"
      }
      const userInfo2 = {
        name: "ronaldo",
        birthDate: new Date(1991, 10, 10),
        city: "São Paulo",
        country: "Brasil",
        password: "ronaldo123",
        username: "fenomeno"
      }

      const createdMovie = await moviesCtrl.register(movieInfo1)
      const createdUser1 = await usersCtrl.register(userInfo1)
      const createdUser2 = await usersCtrl.register(userInfo2)

      await moviesCtrl.vote(createdMovie._id, createdUser1._id, 4)
      await moviesCtrl.vote(createdMovie._id, createdUser2._id, 2)

      const votedMovieDetails = await moviesCtrl.details(createdMovie._id)

      expect(votedMovieDetails).toMatchObject({ rating: 3 })
    })

    it("lança um erro caso o filme não exista", async () => {
      const inexistentId = "507f1f77bcf86cd799439011"

      await expect(
        moviesCtrl.details(inexistentId)
      ).rejects.toBeInstanceOf(HttpError)
    })
  })
})
