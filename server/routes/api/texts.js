const express = require('express')
const router = express.Router()
const asyncWrap = require('../../middleware/asyncWrap')
const textsService = require('../../services/texts')

// Load
router.post(
  '/:textId/load',
  asyncWrap(async (req, res) => {
    const data = await textsService.load(req.params.textId, req.body.password)
    res.json({
      status: true,
      ...data,
    })
  })
)

// Next/prev textId
router.get(
  '/next/:textId/:projectId/:showConfirmed/:prev',
  asyncWrap(async (req, res) => {
    const textId = await textsService.getNext(
      req.params.textId,
      req.params.projectId,
      req.params.showConfirmed,
      req.params.prev === 'true'
    )
    res.json({
      status: true,
      textId,
    })
  })
)

// Update text
router.put(
  '/:textId',
  asyncWrap(async (req, res) => {
    await textsService.update(
      req.body.textRaw,
      req.body.htmlText,
      req.params.textId,
      req.body.projectId,
      req.body.user,
      req.body.newWords,
      req.body.password,
      req.body.classifications
    )
    res.json({ status: true })
  })
)

// Check all texts
router.post(
  '/check',
  asyncWrap(async (req, res) => {
    const result = await textsService.checkAll(
      req.body.projectId,
      req.body.password
    )
    res.json({ status: true, hits: result })
  })
)

// Export Texts
router.post(
  '/export',
  asyncWrap(async (req, res) => {
    await textsService.exportAll(
      req.body.projectId,
      req.body.folderPath,
      req.body.password
    )
    res.json({ status: true })
  })
)

module.exports = router
