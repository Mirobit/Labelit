import { sendData } from '../api.js'
import { switchPage } from '../index.js'
import { displayMessage } from '../components/message.js'
import Store from '../store.js'

const init = () => {
  document.title = `Labelit`
  displayMessage(false, 'You are not logged-in or your session exired')
  Store.loginPage.hidden = false
  document.addEventListener('keyup', handleEnterPassword)
}

const close = () => {
  Store.loginPage.hidden = true
  document.getElementById('userPassword').value = ''
  document.getElementById('username').value = ''
  document.removeEventListener('keyup', handleEnterPassword)
}

const login = async () => {
  const result = await sendData(`/auth/login`, 'POST', {
    username: document.getElementById('username').value,
    userPassword: document.getElementById('userPassword').value,
  })

  if (result.status !== 200) {
    return
  }

  Store.loggedIn = true
  localStorage.setItem('identity', result.jwtToken)
  switchPage(close, '/')
}

const handleEnterPassword = (event) => {
  if (event.key === 'Enter') login()
}

export { init, login }
