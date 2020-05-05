import { sendData } from '../api.js'
import { switchPage } from '../index.js'
import { displayMessage } from '../components/message.js'
import Store from '../store.js'

const init = () => {
  // document.getElementById('navPathHeader').hidden = true
  document.title = `Labelit`
  displayMessage(false, 'You are not logged-in or your session exired')
  Store.loginPage.hidden = false
}

const close = () => {
  Store.loginPage.hidden = true
  // document.getElementById('navPathHeader').hidden = false
  document.getElementById('userPassword').value = ''
  document.getElementById('username').value = ''
}

const login = async () => {
  const result = await sendData(`/auth/login`, 'POST', {
    username: document.getElementById('username').value,
    userPassword: document.getElementById('userPassword').value,
  })

  if (result.status !== 200) {
    return
  }

  localStorage.setItem('identity', result.jwtToken)
  switchPage(close, '/')
}

export { init, login }
