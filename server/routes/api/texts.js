const express = require('express')
const router = express.Router()
const textsService = require('../../services/texts')

// Load
router.post('/:textId/load', async (req, res) => {
  try {
    const data = await textsService.load(req.params.textId, req.body.password)
    res.json({
      status: true,
      ...data,
    })
  } catch (error) {
    res.json({ status: false })
  }
})

// Next/prev textId
router.get(
  '/next/:textId/:projectId/:showConfirmed/:prev',
  async (req, res) => {
    try {
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
    } catch (error) {
      console.log(error)
      res.json({ status: false })
    }
  }
)

// Update text
router.put('/:textId', async (req, res) => {
  try {
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
  } catch (error) {
    console.log(error)
    res.json({ status: false })
  }
})

// Check all texts
router.post('/check', async (req, res) => {
  try {
    const result = await textsService.checkAll(
      req.body.projectId,
      req.body.password
    )
    res.json({ status: true, hits: result })
  } catch (error) {
    console.log(error)
    res.json({ status: false })
  }
})

// Export Texts
router.post('/export', async (req, res) => {
  try {
    await textsService.exportAll(
      req.body.projectId,
      req.body.folderPath,
      req.body.password
    )
    res.json({ status: true })
  } catch (error) {
    console.log(error)
    res.json({ status: false })
  }
})

module.exports = router
