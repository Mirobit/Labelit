const express = require('express')
const path = require('path')
const router = express.Router()

router.get('/:id', (req, res) => {
  console.log('Project name:', req.params.id)
  res.sendFile(path.join(__dirname, '../public/pages/editor.html'))
})

router.post('/save', (req, res) => {
  console.log('body', req.body)
  res.json(true)
})

module.exports = router
