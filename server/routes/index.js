const express = require('express')
const router = express.Router()

const apiRoutes = require('./api')
const appRoutes = require('./app')

router.use('/api', apiRoutes)
router.use('/', appRoutes)

router.use((req, res) => {
  res.status(404).send({ error: 'not-found' })
})

module.exports = router
