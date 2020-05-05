const express = require('express')
const router = express.Router()

const auth = require('../../middleware/auth')

const textsRoutes = require('./texts')
const projectsRoutes = require('./projects')
const authRoutes = require('./auth')

router.use('/texts', auth, textsRoutes)
router.use('/projects', auth, projectsRoutes)
router.use('/auth', authRoutes)
router.use((req, res) => {
  throw { status: 400, message: 'Invalid API route' }
})

module.exports = router
