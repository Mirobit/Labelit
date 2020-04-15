class Store {
  constructor() {}

  homePage = document.getElementById('homePage')
  projectPage = document.getElementById('projectPage')
  textPage = document.getElementById('textPage')
  passwordPage = document.getElementById('passwordPage')

  messageDiv = document.getElementById('message')

  password = ''
  project = {}
  user = {}
}

export default new Store()
