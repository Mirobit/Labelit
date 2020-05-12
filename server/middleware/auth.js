const jwt = require('jsonwebtoken')
const { AuthError } = require('../utils/errors')

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (authHeader) {
    const token = authHeader.split('Bearer ')[1]

    jwt.verify(token, process.env.SECRET, (err, user) => {
      if (err) {
        throw new AuthError('Invalid sessions, please logout')
      }
      req.user = user
    })
  } else {
    throw new AuthError('Not signed in')
  }
  next()
}

module.exports = auth
