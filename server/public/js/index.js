import { sendData, getData, increase } from './api.js'
import { initPasswordPage, submitPassword } from './password.js'
import {
  removeLabel,
  confirmLabel,
  addLabel,
  clickWord,
  initTextPage,
  updateText,
} from './editor.js'
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
import { createProject, initProjectList, openProject } from './projects.js'
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
    projectsPage.hidden = false
    initProjectList()
    console.log('render projects')
  } else if (route.includes('/projects/')) {
    projectPage.hidden = false
    initProjectPage()
    console.log('render single project')
  } else if (route.includes('/text/')) {
    text.hidden = false
    const textId = route.match(/^\/text\/(.{1,})$/)[1]
    console.log('render text', textId)
    initTextPage()
  } else {
    console.log('Invalid route')
  }
}

const checkIfPassword = (goUrl) => {
  if (Store.project.password === undefined) {
    console.log('init password page')
    initPasswordPage(goUrl)
  }
}

export { init, createProject, switchPage, openProject }
