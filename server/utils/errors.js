class ValError extends Error {
  constructor(message) {
    super(message)

    this.name = this.constructor.name
    this.status = 400
  }
}

class AuthError extends Error {
  constructor(message) {
    super(message)

    this.name = this.constructor.name
    this.status = 401
  }
}

module.exports = { ValError, AuthError }
