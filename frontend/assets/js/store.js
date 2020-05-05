class Store {
  constructor() {}

  homePage = document.getElementById('homePage')
  projectPage = document.getElementById('projectPage')
  textPage = document.getElementById('textPage')
  passwordPage = document.getElementById('passwordPage')
  loginPage = document.getElementById('loginPage')

  messageDiv = document.getElementById('message')

  password = ''
  project = {}
  loggedIn = false
}

export default new Store()
