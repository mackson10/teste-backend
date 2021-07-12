const mongoose = require("mongoose")
const { Schema } = mongoose

const { encrypter } = require("../adapters/encrypter")

const userSchema = new Schema({
  // propriedades livremente atualizaveis pelo usuário
  name: String,
  birthDate: Date,
  city: String,
  country: String,

  // propriedades não atualizaveis pelo usuário
  passwordHash: { type: String, required: true, select: false },
  active: { type: Boolean, default: true },

  // propriedades não atualizaveis
  username: { type: String, required: true, unique: true, minLength: 5 },
  isAdmin: { type: Boolean, default: false }
})

async function hashPasswordFunction (password) {
  return await encrypter.hash(password)
}

async function comparePasswordFunction (password) {
  const userWithHash = await exports.User.findById(this._id).select("passwordHash")
  return await encrypter.compare(password, userWithHash.passwordHash)
}

userSchema.methods.hashPassword = hashPasswordFunction
userSchema.methods.comparePassword = comparePasswordFunction

exports.User = mongoose.model("User", userSchema)
