import * as passwordFuncs from './components/password.js'
import * as textFuncs from './components/text.js'
import * as projectFuncs from './components/project.js'
import * as homeFuncs from './components/home.js'
import Store from './store.js'

const switchPage = async (closeFunc, newUrl) => {
  closeMessage()
  closeFunc()
  history.pushState(null, '', newUrl)
  init()
}

const init = async () => {
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

const displayMessage = (success, message) => {
  if (success === true) {
    Store.messageDiv.innerHTML = `<div class="alert alert-success alert-dismissible" role="alert"><a href="#" class="close" data-dismiss="alert" aria-label="close">×</a>${message}</div>`
  } else {
    Store.messageDiv.innerHTML = `<div class="alert alert-warning alert-dismissible" role="alert"><a href="#" class="close" data-dismiss="alert" aria-label="close">×</a>${message}</div>`
  }
}

const closeMessage = () => {
  document.getElementById('message').innerHTML = ''
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
        switchPage(closeFunc, `/project/${projectName}`)
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

export {
  displayMessage,
  closeMessage,
  switchPage,
  setNavPath,
  init,
  homeFuncs,
  projectFuncs,
  textFuncs,
  passwordFuncs,
}
