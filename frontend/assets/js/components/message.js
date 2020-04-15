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

export { displayMessage, closeMessage }
