class Store {
  constructor() {}

  projectsPage = document.getElementById('projectsPage')
  projectPage = document.getElementById('projectPage')
  textPage = document.getElementById('textPage')
  passwordPage = document.getElementById('passwordPage')

  messageDiv = document.getElementById('message')

  password = ''
  project = {}
  user = {}
}

export default new Store()
