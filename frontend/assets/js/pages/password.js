import { sendData } from '../api.js'
import { switchPage, setNavPath } from '../index.js'
import Store from '../store.js'
import { displayMessage } from '../components/message.js'

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

  setNavPath(close, Store.project.name, goText ? 'Text' : null)

  document.title = `Labelit - Project: ${Store.project.name}`
  document.addEventListener('keyup', handleEnterPassword)
}

const close = () => {
  Store.passwordPage.hidden = true
  document.getElementById('password').value = ''
  document.removeEventListener('keyup', handleEnterPassword)
}

const submitPassword = async () => {
  const passwordDiv = document.getElementById('password')
  const result = await sendData(`/projects/password`, 'POST', {
    projectName: Store.project.name,
    password: passwordDiv.value,
  })
  if (!result.status) {
    displayMessage(false, 'Invalid project')
    return
  }
  if (!result.valid) {
    displayMessage(false, 'Invalid project password')
    return
  }
  Store.password = passwordDiv.value
  switchPage(close, goNext)
}

const handleEnterPassword = (event) => {
  if (event.key === 'Enter') submitPassword()
}

export { init, close, submitPassword }
