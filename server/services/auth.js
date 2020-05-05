const jwt = require('jsonwebtoken')
const { hash } = require('../utils/crypter')

const login = async (username, password) => {
  let userRole = 'user'

  if (username === 'admin') {
    if (process.env.ADMIN_PASSWORD !== password) {
      throw { status: 400, message: 'Invalid admin password' }
    }
    userRole = 'admin'
  } else {
    throw { status: 400, message: 'Invalid user' }
  }

  return jwt.sign({ username, role: userRole }, process.env.SECRET, {
    expiresIn: 1209600,
  })
}

module.exports = {
  login,
}
