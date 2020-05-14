import Store from '../store.js'

const displayMessage = (success, message) => {
  if (success) {
    document.getElementById('messageText').innerText = message
    Store.messageDiv.classList.add('alert-success')
  } else {
    document.getElementById('messageText').innerText = message
    Store.messageDiv.classList.add('alert-warning')
  }
  Store.messageDiv.hidden = false
}

const closeMessage = () => {
  Store.messageDiv.classList.remove('alert-warning')
  Store.messageDiv.classList.remove('alert-success')
  Store.messageDiv.hidden = true
}

export { displayMessage, closeMessage }
