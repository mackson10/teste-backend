const mongoose = require("mongoose")
const { MongoMemoryServer } = require("mongodb-memory-server")

const mongod = new MongoMemoryServer()

exports.connect = async function () {
  const uri = await mongod.getUri()
  const mongooseOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
  await mongoose.connect(uri, mongooseOpts)
}

exports.closeDatabase = async function () {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  await mongod.stop()
}

exports.clearDatabase = async function () {
  const { collections } = mongoose.connection
  for (const key in collections) {
    const collection = collections[key]
    await collection.deleteMany()
  }
}
