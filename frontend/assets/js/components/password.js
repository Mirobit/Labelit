import { sendData } from '../api.js'
import { switchPage, displayMessage, setNavPath } from '../index.js'
import Store from '../store.js'

let goNext

const init = (goUrl) => {
  Store.passwordPage.hidden = false
  goNext = goUrl
  let goText = false
  if (Store.project.name === undefined) {
    const pathArr = window.location.pathname.split('/')
    Store.project.name = decodeURI(pathArr[2])
    if (pathArr[4]) goText = true
  }

  setNavPath(Store.passwordPage, Store.project.name, goText ? 'Text' : null)

  document.title = `Labelit - Project: ${Store.project.name}`
  document.addEventListener('keyup', handleEnterPassword)
}

const close = () => {
  Store.passwordPage.hidden = true
  document.removeEventListener('keyup', handleEnterPassword)
}

const submitPassword = async () => {
  const passwordDiv = document.getElementById('password')
  const resultPassword = await sendData(`/projects/password`, 'POST', {
    projectName: Store.project.name,
    password: passwordDiv.value,
  })
  if (!resultPassword.valid) {
    displayMessage(false, 'Invalid project password')
    return
  }
  Store.password = passwordDiv.value

  switchPage(Store.passwordPage, goNext)
}

const handleEnterPassword = (event) => {
  if (event.key === 'Enter') submitPassword()
}

export { init, close, submitPassword }
