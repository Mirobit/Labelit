const express = require('express')
const path = require('path')
const router = express.Router()

// Main
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../views/index.html'))
})

// Editor
router.get('/text/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../../views/editor.html'))
})

// Project
router.get('/projects/:name', (req, res) => {
  res.sendFile(path.join(__dirname, '../../views/project.html'))
})

// Projects
router.get('/projects', (req, res) => {
  res.sendFile(path.join(__dirname, '../../views/projects.html'))
})

module.exports = router
