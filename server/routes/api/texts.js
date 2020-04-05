const express = require('express')
const router = express.Router()
const textsService = require('../../services/texts')

router.post('/:textId/init', async (req, res) => {
  try {
    const data = await textsService.init(req.params.textId, req.body.password)
    console.log(data)
    res.json({
      status: true,
      ...data
    })
  } catch (error) {
    console.log(error)
    res.json({ status: false })
  }
})

// Save edited text
router.post('/', async (req, res) => {
  console.log('body', req.body)
  res.json(true)
})

module.exports = router
