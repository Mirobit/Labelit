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

// Security
app.disable('x-powered-by')
app.use((req, res, next) => {
  res.header('X-Frame-Options', 'DENY')
  res.header('Strict-Transport-Security', 'max-age=31536000')
  res.header('X-Content-Type-Options', 'nosniff')
  res.header('Referrer-Policy', 'same-origin')
  res.header('X-XSS-Protection', '1 mode=block')
  res.header(
    'Content-Security-Policy',
    "default-src 'self' script-src 'unsafe-inline'"
  )
  next()
})

app.use(express.static(path.join(__dirname, '../frontend/assets')))
app.use(routes)

app.listen(process.env.PORT, () => {
  console.log(`Server is up and running: http://localhost:${process.env.PORT}`)
})
