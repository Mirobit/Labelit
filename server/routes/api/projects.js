const express = require('express')
const router = express.Router()
const asyncWrap = require('../../middleware/asyncWrap')
const projectsService = require('../../services/projects')

// Single
router.get(
  '/:name',
  asyncWrap(async (req, res) => {
    const project = await projectsService.get(req.params.name)
    res.json({ status: 200, project })
  })
)

// List
router.get(
  '/',
  asyncWrap(async (req, res) => {
    const projects = await projectsService.list()
    res.json({ status: 200, projects })
  })
)

// New
router.post(
  '/',
  asyncWrap(async (req, res) => {
    await projectsService.create({
      name: req.body.name,
      description: req.body.description,
      inputMode: req.body.inputMode,
      inputPath: req.body.inputPath,
      password: req.body.password,
      classActive: req.body.classification,
    })
    res.json({ status: 200 })
  })
)

// Update
router.put(
  '/:id',
  asyncWrap(async (req, res) => {
    await projectsService.update(req.params.id, {
      name: req.body.name,
      description: req.body.description,
      showConfirmed: req.body.showConfirmed,
    })
    res.json({ status: 200 })
  })
)

// Remove
router.delete(
  '/:id',
  asyncWrap(async (req, res) => {
    await projectsService.remove(req.params.id)
    res.json({ status: 200 })
  })
)

// Check Passswort
router.post(
  '/password',
  asyncWrap(async (req, res) => {
    await projectsService.checkPassword(req.body.projectName, req.body.password)
    res.json({ status: 200 })
  })
)

// Add Category
router.post(
  '/:projectId/categories',
  asyncWrap(async (req, res) => {
    await projectsService.addCategory(req.params.projectId, {
      name: req.body.name,
      key: req.body.key,
      keyUp: req.body.key.toUpperCase(),
      color: req.body.color,
      colorHex: req.body.colorHex,
    })
    res.json({ status: 200 })
  })
)

// Update Category
router.put(
  '/:projectId/categories/:categoryId',
  asyncWrap(async (req, res) => {
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
    res.json({ status: 200 })
  })
)

// Remove Category
router.delete(
  '/:projectId/categories/:categoryId',
  asyncWrap(async (req, res) => {
    await projectsService.removeCategory(
      req.params.projectId,
      req.params.categoryId
    )
    res.json({ status: 200 })
  })
)

// Add Classification
router.post(
  '/:projectId/classifications',
  asyncWrap(async (req, res) => {
    await projectsService.addClassification(req.params.projectId, {
      name: req.body.name,
    })
    res.json({ status: 200 })
  })
)

// Update Classification
router.put(
  '/:projectId/classifications/:classificationId',
  asyncWrap(async (req, res) => {
    await projectsService.updateClassification(
      req.params.projectId,
      req.params.classificationId,
      {
        name: req.body.name,
      }
    )
    res.json({ status: 200 })
  })
)

// Remove Classification
router.delete(
  '/:projectId/classifications/:classificationId',
  asyncWrap(async (req, res) => {
    await projectsService.removeClassification(
      req.params.projectId,
      req.params.classificationId
    )
    res.json({ status: 200 })
  })
)

module.exports = router
