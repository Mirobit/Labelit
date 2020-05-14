import Store from '../store.js'

const displayMessage = (success, message) => {
  Store.messageDiv.hidden = false
  if (success) {
    Store.messageDiv.classList.add('alert-success')
    Store.messageDiv.classList.remove('alert-warning')
    document.getElementById('messageText').innerText = message
  } else {
    Store.messageDiv.classList.add('alert-warning')
    Store.messageDiv.classList.remove('alert-success')
    document.getElementById('messageText').innerText = message
  }
}

const closeMessage = () => {
  Store.messageDiv.hidden = true
}

export { displayMessage, closeMessage }
