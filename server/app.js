'use strict'

require('dotenv').config()
const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const logger = require('pino')('./error.log')
const fs = require('fs')

const { ValError } = require('./utils/errors')
global.ValError = ValError

const security = require('./middleware/security')
const routes = require('./routes')

global.PROJECT_VERSION = 1
global.TEXT_VERSION = 1

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

// // Only for remote servers
// if (process.env.REMOTE_MODE) {
//   const Busboy = require('busboy')
//   app.post('/api/upload', (req, res) => {
//     const busboy = new Busboy({ headers: req.headers })
//     busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
//       const saveTo = path.join('.', filename)
//       console.log('Uploading: ' + saveTo)
//       file.pipe(fs.createWriteStream(saveTo))
//     })
//     busboy.on('finish', function () {
//       console.log('Upload complete')
//       res.writeHead(200, { Connection: 'close' })
//       res.end('test')
//     })
//     return req.pipe(busboy)
//   })
// }

app.use(routes)
app.use((error, req, res, next) => {
  let message = error.message
  if (!error.status) {
    message = 'server'
    if (process.env.NODE_ENV === 'development') console.log(error)
    else logger.info(error)
  }
  res.json({ status: error.status ? error.status : 500, message })
})

app.listen(process.env.PORT, () => {
  console.log(`Server is up and running: http://localhost:${process.env.PORT}`)
})
