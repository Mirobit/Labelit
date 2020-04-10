class Store {
  constructor() {
    console.log('init store')
  }

  projectsPage = document.getElementById('projectsPage')
  projectPage = document.getElementById('projectPage')
  textPage = document.getElementById('textPage')
  passwordPage = document.getElementById('passwordPage')

  password = ''
  project = {}
  text = {}
  user = {}
  path = ''

  present() {
    return 'Myname is ' + this.name
  }
}

export default new Store()
