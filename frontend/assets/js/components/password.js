import { sendData } from '../api.js'
import { switchPage, displayMessage } from '../index.js'
import Store from '../store.js'

let goNext

const initPasswordPage = (goUrl) => {
  Store.passwordPage.hidden = false
  goNext = goUrl
  if (Store.project.name === undefined) {
    const pathArr = window.location.pathname.split('/')
    Store.project.name = pathArr[2]
  }
  document.addEventListener('keyup', handleEnterPassword)
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
  console.log('setting pw', Store.password)
  document.removeEventListener('keyup', handleEnterPassword)
  switchPage(Store.passwordPage, goNext)
}

const handleEnterPassword = (event) => {
  if (event.key === 'Enter') submitPassword()
}

export { initPasswordPage, submitPassword }
