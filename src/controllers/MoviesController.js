const mongoose = require("mongoose")

const { HttpError } = require("../HttpError")
const User = mongoose.model("User")
const Movie = mongoose.model("Movie")
const Vote = mongoose.model("Vote")

module.exports.MoviesController = class {
  // constructor () {}

  async register ({
    title,
    releaseDate,
    description,
    director,
    genre,
    casting
  }) {
    const movieFound = await Movie.findOne({ title })
    if (movieFound) {
      throw new HttpError(400, "Movie already registered")
    } else {
      const newMovie = new Movie({
        title,
        releaseDate,
        description,
        director,
        genre,
        casting
      })

      try {
        await newMovie.validate()
      } catch (validationErrors) {
        throw new HttpError(400, "Bad request", validationErrors)
      }

      return await newMovie.save()
    }
  }

  async updateInfo (movieId, {
    title,
    releaseDate,
    description,
    director,
    genre,
    casting
  }) {
    const updateObject = {
      title,
      releaseDate,
      description,
      director,
      genre,
      casting
    }

    let movieFound

    if (mongoose.isValidObjectId(movieId)) {
      movieFound = await Movie.findById(movieId)
    }

    if (!movieFound) {
      throw new HttpError(404, "Movie not found")
    } else if (typeof updateObject !== "object") {
      throw new HttpError(400, "Bad Request")
    } else {
      for (const key in updateObject) {
        if (updateObject[key]) {
          movieFound[key] = updateObject[key]
        }
      }

      try {
        await movieFound.validate()
      } catch (validationErrors) {
        throw new HttpError(400, "Bad request", validationErrors)
      }

      return await movieFound.save()
    }
  }

  async vote (movieId, userId, value) {
    let userFound, movieFound

    if (mongoose.isValidObjectId(userId)) {
      userFound = await User.findById(userId)
    }
    if (mongoose.isValidObjectId(movieId)) {
      movieFound = await Movie.findById(movieId)
    }

    if (!userFound) {
      throw new HttpError(404, "User not found")
    } else if (!movieFound) {
      throw new HttpError(404, "movie not found")
    } else {
      const session = await Vote.startSession()
      session.startTransaction()

      try {
        await Vote.findOneAndDelete({
          user: mongoose.Types.ObjectId(userId),
          movie: mongoose.Types.ObjectId(movieId)
        })

        const newVote = new Vote({
          user: mongoose.Types.ObjectId(userId),
          movie: mongoose.Types.ObjectId(movieId),
          value
        })

        await newVote.save()
        await session.commitTransaction()
        session.endSession()
      } catch (e) {
        await session.abortTransaction()
        session.endSession()
        throw new HttpError()
      }
    }
  }

  async list ({ title, director, genre, castingNames } = {}) {
    const query = { title, director, genre, castingNames }
    const queryObject = {}

    for (const key in query) {
      if (query[key]) {
        if (key === "castingNames") {
          queryObject["casting.name"] = { $all: query[key] }
        } else { queryObject[key] = query[key] }
      }
    }

    const movieList = await Movie.find(queryObject)
      .select({ title: 1, releaseDate: 1, director: 1 })

    return movieList
  }

  async details (movieId) {
    let movieFound

    if (mongoose.isValidObjectId(movieId)) {
      movieFound = await Movie.findById(movieId)
    }

    if (!movieFound) {
      throw new HttpError(404, "Movie not found")
    } else {
      const movieObj = movieFound.toObject()
      movieObj.rating = await movieFound.getRating()
      return movieObj
    }
  }
}
