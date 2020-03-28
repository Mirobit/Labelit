const express = require('express')
const router = express.Router()

const textsRoutes = require('./texts')
const projectsRoutes = require('./projects')

router.use('/texts', textsRoutes)
router.use('/projects', projectsRoutes)

module.exports = router
