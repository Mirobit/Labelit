const express = require('express')
const router = express.Router()
const asyncWrap = require('../../middleware/asyncWrap')
const authService = require('../../services/auth')

router.use(
  '/login',
  asyncWrap(async (req, res) => {
    const jwtToken = await authService.login(
      req.body.username,
      req.body.userPassword
    )
    res.json({ status: 200, jwtToken })
  })
)

module.exports = router
