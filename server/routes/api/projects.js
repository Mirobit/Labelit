const express = require('express')
const router = express.Router()
const projectsService = require('../../services/projects')

// Single
router.get('/:name', async (req, res) => {
  try {
    const project = await projectsService.get(req.params.name)
    res.json({ status: true, project })
  } catch (error) {
    console.log(error)
    res.json({ status: false })
  }
})

// List
router.get('/', async (req, res) => {
  try {
    const projects = await projectsService.list()
    res.json({ status: true, projects })
  } catch (error) {
    console.log(error)
    res.json({ status: false })
  }
})

// New
router.post('/', async (req, res) => {
  try {
    await projectsService.create({
      name: req.body.name,
      description: req.body.description,
      folderPath: req.body.folderPath,
      password: req.body.password,
      classActive: req.body.classification,
    })
    res.json({ status: true })
  } catch (error) {
    console.log(error)
    res.json({ status: false })
  }
})

// Update
router.put('/:id', async (req, res) => {
  try {
    await projectsService.update(req.params.id, {
      name: req.body.name,
      description: req.body.description,
      showConfirmed: req.body.showConfirmed,
    })
    res.json({ status: true })
  } catch (error) {
    console.log(error)
    res.json({ status: false })
  }
})

// Remove
router.delete('/:id', async (req, res) => {
  try {
    await projectsService.remove(req.params.id)
    res.json({ status: true })
  } catch (error) {
    console.log(error)
    res.json({ status: false })
  }
})

// Check Passswort
router.post('/password', async (req, res) => {
  try {
    const result = await projectsService.checkPassword(
      req.body.projectName,
      req.body.password
    )
    res.json({ status: true, valid: result })
  } catch (error) {
    console.log(error)
    res.json({ status: false })
  }
})

// Add Category
router.post('/:projectId/categories', async (req, res) => {
  try {
    await projectsService.addCategory(req.params.projectId, {
      name: req.body.name,
      key: req.body.key,
      keyUp: req.body.key.toUpperCase(),
      color: req.body.color,
      colorHex: req.body.colorHex,
    })
    res.json({ status: true })
  } catch (error) {
    console.log(error)
    res.json({ status: false })
  }
})

// Update Category
router.put('/:projectId/categories/:categoryId', async (req, res) => {
  try {
    await projectsService.updateCategory(
      req.params.projectId,
      req.params.categoryId,
      {
        name: req.body.name,
        key: req.body.key,
        keyUp: req.body.key.toUpperCase(),
        color: req.body.color,
        colorHex: req.body.colorHex,
      }
    )
    res.json({ status: true })
  } catch (error) {
    console.log(error)
    res.json({ status: false })
  }
})

// Remove Category
router.delete('/:projectId/categories/:categoryId', async (req, res) => {
  try {
    await projectsService.removeCategory(
      req.params.projectId,
      req.params.categoryId
    )
    res.json({ status: true })
  } catch (error) {
    console.log(error)
    res.json({ status: false })
  }
})

// Add Classification
router.post('/:projectId/classifications', async (req, res) => {
  try {
    await projectsService.addClassification(req.params.projectId, {
      name: req.body.name,
    })
    res.json({ status: true })
  } catch (error) {
    console.log(error)
    res.json({ status: false })
  }
})

// Update Classification
router.put(
  '/:projectId/classifications/:classificationId',
  async (req, res) => {
    try {
      await projectsService.updateClassification(
        req.params.projectId,
        req.params.classificationId,
        {
          name: req.body.name,
        }
      )
      res.json({ status: true })
    } catch (error) {
      console.log(error)
      res.json({ status: false })
    }
  }
)

// Remove Classification
router.delete(
  '/:projectId/classifications/:classificationId',
  async (req, res) => {
    try {
      await projectsService.removeClassification(
        req.params.projectId,
        req.params.classificationId
      )
      res.json({ status: true })
    } catch (error) {
      console.log(error)
      res.json({ status: false })
    }
  }
)

module.exports = router
