import * as passwordFuncs from './components/password.js'
import * as textFuncs from './components/text.js'
import * as projectFuncs from './components/project.js'
import * as projectsFuncs from './components/projects.js'
import Store from './store.js'

const switchPage = async (oldPage, newUrl) => {
  closeMessage()
  oldPage.hidden = true
  history.pushState(null, '', newUrl)
  init()
}

const init = async () => {
  // console.log(window['projectsPage'])
  console.log('init')
  const route = window.location.pathname
  if (route === '/') {
    // TODO index page
    console.log('render index')
  } else if (route === '/projects') {
    projectsFuncs.initProjectsPage()
  } else if (route.includes('/text/')) {
    if (checkIfPassword(route)) {
      return
    }
    textFuncs.initTextPage()
  } else if (route.includes('/projects/')) {
    if (checkIfPassword(route)) {
      return
    }
    projectFuncs.initProjectPage()
  } else {
    displayMessage(false, 'Invalid url')
  }
}

const checkIfPassword = (goUrl) => {
  if (Store.password === '') {
    passwordFuncs.initPasswordPage(goUrl)
    return true
  }
  return false
}

const displayMessage = (success, message) => {
  if (success === true) {
    Store.messageDiv.innerHTML = `<div class="alert alert-success" role="alert">${message}</div>`
  } else {
    Store.messageDiv.innerHTML = `<div class="alert alert-danger" role="alert">${message}</div>`
  }
}

const closeMessage = () => {
  document.getElementById('message').innerHTML = ''
}

export {
  displayMessage,
  closeMessage,
  switchPage,
  init,
  projectsFuncs,
  projectFuncs,
  textFuncs,
  passwordFuncs,
}
