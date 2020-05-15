class Store {
  constructor() {}

  homePage = document.getElementById('homePage')
  projectPage = document.getElementById('projectPage')
  textPage = document.getElementById('textPage')
  passwordPage = document.getElementById('passwordPage')
  loginPage = document.getElementById('loginPage')

  messageDiv = document.getElementById('message')
  messageTextSpan = document.getElementById('messageTexts')

  password = null
  project = {}
  loggedIn = false
  os = 'Mac'
}

export default new Store()
