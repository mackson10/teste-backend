const mongoose = require("mongoose")
const { Schema } = mongoose

const voteSchema = new Schema({
  user: { type: mongoose.Types.ObjectId, ref: "User" },
  value: { type: Number, min: 0, max: 4, default: 0 }
})

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
  ],
  votes: [voteSchema]
})

function computeRating () {
  if (this.votes.length === 0) return null

  let votesSum = 0
  for (const vote of this.votes) {
    votesSum += vote.value
  }

  return votesSum / this.votes.length
}

movieSchema.virtual("rating").get(computeRating)

exports.Movie = mongoose.model("Movie", movieSchema)
