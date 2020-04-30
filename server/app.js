'use strict'

require('dotenv').config()
const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const logger = require('pino')('./error.log')

const security = require('./middleware/security')
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
app.use(security)
app.use(express.static(path.join(__dirname, '../frontend/assets')))
app.use(routes)
app.use((error, req, res, next) => {
  let message = error.message
  if (error.name !== 'Custom') {
    message = 'server'
    if (process.env.NODE_ENV === 'development') console.log(error)
    else logger.info(error)
  }
  res.json({ status: false, message })
})

app.listen(process.env.PORT, () => {
  console.log(`Server is up and running: http://localhost:${process.env.PORT}`)
})
