const express = require('express')
const router = express.Router()
const projectsService = require('../services/projects')

router.get('/', (req, res) => {
  try {
    const projects = await projectsService.list()
    res.json(projects)
  } catch(error) {
    console.log(error)
    res.json({ result: false })
  }
})

router.get('/:name', (req, res) => {
  try {
    const project = await projectsService.get(req.params.name)
    res.json(project)
  } catch(error) {
    console.log(error)
    res.json({ result: false })
  }
})

router.post('/', (req, res) => {
  try {
    await projectsService.create({
      name: req.body.name,
      descripion: req.body.description,
      filePath: req.body.filePath
    })
    res.json({ result: true })
  } catch(error) {
    console.log(error)
    res.json({ result: false })
  }
})

router.put('/update', (req, res) => {
  try {
    const project = await projectsService.update({
      name: req.body.name,
      descripion: req.body.description,
      filePath: req.body.filePath
    })
    res.json(project)
  } catch(error) {
    console.log(error)
    res.json({ result: false })
  }
})

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
