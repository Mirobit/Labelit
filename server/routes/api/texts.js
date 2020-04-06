const express = require('express')
const router = express.Router()
const textsService = require('../../services/texts')

router.post('/:textId/init', async (req, res) => {
  try {
    const data = await textsService.init(req.params.textId, req.body.password)
    res.json({
      status: true,
      ...data
    })
  } catch (error) {
    console.log(error)
    res.json({ status: false })
  }
})

// Update text
router.put('/', async (req, res) => {
  try {
    const result = textsService.update(
      req.body.textRaw,
      req.body.htmlText,
      req.body.textId,
      req.body.projectId,
      req.body.user,
      req.body.newWords,
      req.body.password
    )
    res.json({ status: true })
  } catch (error) {
    console.log(error)
    res.json({ status: false })
  }
})

module.exports = router
