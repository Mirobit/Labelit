import { displayMessage } from './components/message.js'

const BASE_URL = window.location.origin

const sendData = async (endpoint, type, data) => {
  const url = BASE_URL + '/api' + endpoint
  const options = {
    method: type,
    headers: {
      Accept: 'application/json',
      Authorization: 'test',
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
      Authorization: 'test',
    },
  }

  const response = await fetch(url, options)
  const result = await response.json()
  handleError(result)
  return result
}

const handleError = async (result) => {
  if (result.status) return

  const message =
    result.message === 'server'
      ? "Unexpected server error. Couldn't finish action."
      : result.message
  displayMessage(false, message)
}

export { sendData, getData }
