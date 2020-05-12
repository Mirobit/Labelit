const jwt = require('jsonwebtoken')

const login = async (username, password) => {
  let userRole = 'user'

  if (username === 'admin') {
    if (process.env.ADMIN_PASSWORD !== password) {
      throw new ValError('Invalid admin password')
    }
    userRole = 'admin'
  } else {
    throw new ValError('Invalid user')
  }

  return jwt.sign({ username, role: userRole }, process.env.SECRET, {
    expiresIn: 1209600,
  })
}

module.exports = {
  login,
}
