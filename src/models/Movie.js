const mongoose = require("mongoose")
const { Schema } = mongoose

const Vote = mongoose.model("Vote")

const movieSchema = new Schema({
  title: { type: String, required: true, unique: true },
  releaseDate: { type: Date, required: true },
  description: String,
  director: { type: String, required: true },
  genre: { type: String, required: true },
  casting: [
    {
      name: { type: String, required: true },
      role: { type: String, required: true }
    }
  ]
})

async function computeRating () {
  const movieVotes = await Vote.find({ movie: this._id })

  if (movieVotes.length === 0) return 0

  let votesSum = 0
  for (const vote of movieVotes) {
    votesSum += vote.value
  }

  return votesSum / movieVotes.length
}

movieSchema.methods.getRating = computeRating

exports.Movie = mongoose.model("Movie", movieSchema)
