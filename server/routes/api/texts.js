const express = require('express')
const router = express.Router()
const textsService = require('../../services/texts')

// Texeditor init
router.post('/:textId/init', async (req, res) => {
  try {
    const data = await textsService.init(req.params.textId, req.body.password)
    res.json({
      status: true,
      ...data
    })
  } catch (error) {
    res.json({ status: false })
  }
})

router.post('/:textId/load', async (req, res) => {
  try {
    const content = await textsService.get(req.params.textId, req.body.password)
    res.json({
      status: true,
      content
    })
  } catch (error) {
    res.json({ status: false })
  }
})

// Update text
router.put('/', async (req, res) => {
  console.log(req.body.textId)
  try {
    const result = await textsService.update(
      req.body.textRaw,
      req.body.htmlText,
      req.body.textId,
      req.body.projectId,
      req.body.user,
      req.body.newWords,
      req.body.password
    )
    res.json({
      status: true,
      nextTextId: result.nextTextId,
      nextTextName: result.nextTextName
    })
  } catch (error) {
    res.json({ status: false })
  }
})

module.exports = router
