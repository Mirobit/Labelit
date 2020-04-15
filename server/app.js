require('dotenv').config()

const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const routes = require('./routes')

mongoose.Promise = Promise
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('Connected to Mongo!')
  })
  .catch((error) => {
    console.error('Error connecting to mongo', error)
  })

const app = express()
app.use(express.json())
// app.use((req, res, next) => {
//   res.header(
//     'Access-Control-Allow-Origin',
//     `http://localhost:${process.env.PORT}`
//   )
//   res.header(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept'
//   )
//   next()
// })
app.use(express.static(path.join(__dirname, '../frontend/assets')))
app.use(routes)

app.listen(process.env.PORT, () => {
  console.log(`Server is up and running: http://localhost:${process.env.PORT}`)
})
