import { sendData } from './api.js'
import { switchPage } from './index.js'
import Store from './store.js'

let goNext

const initPasswordPage = (goUrl) => {
  goNext = goUrl
  document.addEventListener('keyup', handleEnterPassword)
}

const submitPassword = async () => {
  const passwordDiv = document.getElementById('password')
  const resultPassword = await sendData(
    `/projects/${Store.project._id}/password`,
    'POST',
    {
      password: passwordDiv.value,
    }
  )
  if (!resultPassword.valid) {
    displayMessage(false, 'Invalid project password')
    return
  }
  Store.project.password = passwordDiv.value
  document.removeEventListener('keyup', handleEnterPassword)
  switchPage(Store.passwordPage, goNext)
}

const handleEnterPassword = (event) => {
  if (event.key === 'Enter') submitPassword()
}

export { initPasswordPage, submitPassword }
