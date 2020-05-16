import { sendData } from '../api.js'
import { switchPage, setNavPath } from '../index.js'
import Store from '../store.js'

let goNext

const init = (goUrl) => {
  Store.currentClose = close
  goNext = goUrl
  let goText = false
  if (Store.project.name === undefined) {
    const pathArr = window.location.pathname.split('/')
    Store.project.name = decodeURI(pathArr[2])
    if (pathArr[4]) goText = true
  }

  setNavPath(close, Store.project.name, goText ? 'Text' : null)

  document.title = `Labelit - Project: ${Store.project.name}`
  Store.passwordPage.hidden = false
  document.addEventListener('keyup', handleEnterPassword)
}

const close = () => {
  Store.passwordPage.hidden = true
  document.getElementById('password').value = ''
  document.removeEventListener('keyup', handleEnterPassword)
}

const submitPassword = async () => {
  const password = document.getElementById('password').value
  const result = await sendData(`/projects/password`, 'POST', {
    projectName: Store.project.name,
    password,
  })

  if (result.status !== 200) {
    return
  }

  Store.password = password
  switchPage(close, goNext)
}

const handleEnterPassword = (event) => {
  if (event.key === 'Enter') submitPassword()
}

export { init, close, submitPassword }
