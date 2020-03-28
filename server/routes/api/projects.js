const express = require('express')
const router = express.Router()
const projectsService = require('../../services/projects')

// Single
router.get('/:id', (req, res) => {
  try {
    const project = await projectsService.get(req.params.id)
    res.json(project)
  } catch(error) {
    console.log(error)
    res.json({ result: false })
  }
})

// All
router.get('/', (req, res) => {
  try {
    const projects = await projectsService.list()
    res.json(projects)
  } catch(error) {
    console.log(error)
    res.json({ result: false })
  }
})

// New
router.post('/', (req, res) => {
  try {
    await projectsService.create({
      name: req.body.id,
      descripion: req.body.description,
      filePath: req.body.filePath
    })
    res.json({ result: true })
  } catch(error) {
    console.log(error)
    res.json({ result: false })
  }
})

// Update
router.put('/:id', (req, res) => {
  try {
    const project = await projectsService.update({
      name: req.body.id,
      descripion: req.body.description,
      filePath: req.body.filePath
    })
    res.json(project)
  } catch(error) {
    console.log(error)
    res.json({ result: false })
  }
})

// Remove
router.delete('/:id', (req, res) => {
  try {
    await projectsService.remove(req.body.name)
    res.json({ result: true })
  } catch(error) {
    console.log(error)
    res.json({ result: false })
  }
})

module.exports = router
