import { displayMessage } from './components/message.js'

const BASE_URL = window.location.origin

const sendData = async (endpoint, type, data) => {
  const url = BASE_URL + '/api' + endpoint
  const options = {
    method: type,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${localStorage.getItem('identity')}`,
      'Content-Type': 'application/json;charset=UTF-8',
    },
    body: JSON.stringify(data),
  }
  const response = await fetch(url, options)
  const result = await response.json()
  handleError(result)
  return result
}

const getData = async (endpoint) => {
  const url = BASE_URL + '/api' + endpoint
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('identity')}`,
    },
  }

  const response = await fetch(url, options)
  const result = await response.json()
  handleError(result)
  return result
}

const handleError = (result) => {
  if (result.status === 200) return

  if (result.status === 401) {
    window.location.pathname = '/login/'
    return
  }

  displayMessage(
    false,
    result.status === 400
      ? result.message
      : "Unexpected server error. Couldn't finish action."
  )
}

export { sendData, getData }
