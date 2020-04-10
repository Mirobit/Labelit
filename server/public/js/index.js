import { sendData, getData, increase } from './api.js'
import { initPasswordPage, submitPassword } from './password.js'
import {
  removeLabel,
  confirmLabel,
  addLabel,
  clickWord,
  initTextPage,
  updateText,
} from './text.js'
import {
  initProjectPage,
  updateProject,
  removeProject,
  addCategory,
  showEditCategory,
  updateCategory,
  removeCategory,
  exportTexts,
  checkTexts,
  showNewCategory,
  showProjectForm,
} from './project.js'
import { createProject, initProjectsPage, openProject } from './projects.js'
import Store from './store.js'

const switchPage = async (oldPage, newUrl) => {
  oldPage.hidden = true
  //newPage.hidden = false
  console.log('switching from', oldPage, ' to ', newUrl)
  history.pushState(null, '', newUrl)
  init()
}

const init = async () => {
  // console.log(window['projectsPage'])

  const route = window.location.pathname
  console.log(route)
  if (route === '/') {
    console.log('render index')
  } else if (route === '/projects') {
    initProjectsPage()
    console.log('render projects')
  } else if (route.includes('/projects/')) {
    if (checkIfPassword(route)) {
      return
    }
    projectPage.hidden = false
    initProjectPage()
    console.log('render single project')
  } else if (route.includes('/text/')) {
    if (checkIfPassword(route)) {
      return
    }
    initTextPage()
  } else {
    console.log('Invalid route')
  }
}

const checkIfPassword = (goUrl) => {
  console.log('checking pw')
  if (Store.password === '') {
    initPasswordPage(goUrl)
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

export {
  displayMessage,
  switchPage,
  init,
  createProject,
  openProject,
  submitPassword,
}
