const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server-core')

const mongod = new MongoMemoryServer()

const connect = async () => {
  const uri = await mongod.getConnectionString()

  const mongooseOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  }

  await mongoose.connect(uri, mongooseOpts)
}

const close = async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  await mongod.stop()
}

const clear = async () => {
  const collections = mongoose.connection.collections

  for (const key in collections) {
    const collection = collections[key]
    await collection.deleteMany()
  }
}

module.exports = { connect, close, clear }
