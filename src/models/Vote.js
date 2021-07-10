const mongoose = require("mongoose")
const { Schema } = mongoose

const voteSchema = new Schema({
  user: { type: mongoose.Types.ObjectId, ref: "User" },
  movie: { type: mongoose.Types.ObjectId, ref: "Movie" },
  value: { type: Number, min: 0, max: 4, default: 0 }
})

voteSchema.index({ user: 1, movie: 1 }, { unique: true })

exports.Movie = mongoose.model("Vote", voteSchema)
