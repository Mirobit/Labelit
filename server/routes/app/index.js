const express = require('express')
const path = require('path')
const router = express.Router()

// Main
router.get('/', (req, res) => {
  console.log('Project name:', req.params.id)
  res.sendFile(path.join(__dirname, '../../views/pages/index.html'))
})

// Editor
router.get('/text/:id', (req, res) => {
  console.log('Project name:', req.params.id)
  res.sendFile(path.join(__dirname, '../../views/pages/editor.html'))
})

// Project
router.get('/projects/:id', (req, res) => {
  console.log('Project name:', req.params.id)
  res.sendFile(path.join(__dirname, '../../views/pages/projects.html'))
})

// Projects
router.get('/projects', (req, res) => {
  res.sendFile(path.join(__dirname, '../../views/pages/projects.html'))
})

module.exports = router
