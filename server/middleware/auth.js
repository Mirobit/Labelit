const jwt = require('jsonwebtoken')

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (authHeader) {
    const token = authHeader.split('Bearer ')[1]

    jwt.verify(token, process.env.SECRET, (err, user) => {
      if (err) {
        throw { status: 401, message: 'Invalid sessions, please logout' }
      }
      req.user = user
    })
  } else {
    throw { status: 401, message: 'Not signed in' }
  }
  next()
}

module.exports = auth
