import * as passwordFuncs from './pages/password.js'
import * as textFuncs from './pages/text.js'
import * as projectFuncs from './pages/project.js'
import * as homeFuncs from './pages/home.js'
import Store from './store.js'
import { closeMessage, displayMessage } from './components/message.js'

const init = () => {
  const pages = {
    homeFuncs,
    projectFuncs,
    textFuncs,
    passwordFuncs,
  }

  Object.entries(pages).forEach(([name, page]) => (window[name] = page))
  route()
}

const route = async () => {
  const route = window.location.pathname
  if (route === '/') {
    homeFuncs.init()
  } else if (route.includes('/text/')) {
    if (checkIfPassword(route)) {
      return
    }
    textFuncs.init()
  } else if (route.includes('/project/')) {
    if (checkIfPassword(route)) {
      return
    }
    projectFuncs.init()
  } else {
    displayMessage(false, 'Invalid url')
  }
}

const checkIfPassword = (goUrl) => {
  if (Store.password === '') {
    passwordFuncs.init(goUrl)
    return true
  }
  return false
}

const switchPage = async (closeFunc, newUrl) => {
  closeMessage()
  closeFunc()
  history.pushState(null, '', newUrl)
  route()
}

const setNavPath = (closeFunc, projectName, textName) => {
  const divider2 = document.getElementById('navPath2divider')
  const divider3 = document.getElementById('navPath3divider')
  const navPath1El = document.getElementById('navPath1')
  const navPath2El = document.getElementById('navPath2')
  const navPath3El = document.getElementById('navPath3')

  if (projectName) {
    navPath1El.classList.add('link')
    navPath1El.onclick = () => switchPage(closeFunc, `/`)
    divider2.hidden = false
    navPath2El.innerText = `${projectName}`

    if (textName) {
      navPath2El.onclick = () =>
        switchPage(closeFunc, `/project/${encodeURI(projectName)}`)
      navPath2El.classList.add('link')
      divider3.hidden = false
      navPath3El.innerText = `${textName}`
    } else {
      navPath2El.onclick = ''
      navPath2El.classList.remove('link')
      navPath3El.innerText = ''
      divider3.hidden = true
    }
  } else {
    navPath1El.classList.remove('link')
    navPath1El.onclick = ''
    navPath2El.innerText = ''
    navPath3El.innerText = ''
    divider2.hidden = true
    divider3.hidden = true
  }
}

export default init()
export { switchPage, setNavPath }
