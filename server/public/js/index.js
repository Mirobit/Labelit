import { sendData, getData, increase } from './api.js'
// import {
//   removeLabel,
//   confirmLabel,
//   addLabel,
//   clickWord,
//   initTextEditor,
//   submitPassword,
//   updateText,
// } from './editor.js'
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
import { createProject, initProjectList } from './projects.js'

const projectsPage = document.getElementById('projectsPage')
const projectPage = document.getElementById('projectPage')
const textPage = document.getElementById('textPage')

function routeto(newUrl) {
  console.log('red', newUrl)
}

const init = async () => {
  // console.log(window['projectsPage'])
  increase()
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
    const projectName = route.match(/^\/projects\/(.*)$/)[1]
    initProjectPage(projectName)
    console.log('render single project', projectName)
  } else if (route.includes('/text/')) {
    const textId = route.match(/^\/text\/(.*)$/)[1]
    console.log('render text', textId)
  } else {
    console.log('Invalid route')
  }
}

export { init, createProject, routeto }
