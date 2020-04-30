import { closeMessage } from './components/message.js'

const BASE_URL = window.location.origin

const sendData = async (endpoint, type, data) => {
  closeMessage()
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
  return response.json()
}

const getData = async (endpoint) => {
  closeMessage()
  const url = BASE_URL + '/api' + endpoint
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'test',
    },
  }

  const response = await fetch(url, options)
  return response.json()
}

const handleError = (result) => {
  if (result.status === false) {
    // TODO: display error
  }
}

export { sendData, getData }
