import { sendData, getData } from './api.js'

// global vars
let text, textId, textEditiorDiv, salt, wordlist, password

const submitPassword = async () => {
  const passwordDiv = document.getElementById('password')
  //const passwordHashed = new Hashes.SHA256().hex(passwordDiv.value + salt)
  const resultPassword = await sendData(
    '/projects/5e8a0e0f419c484684f4d76c/password',
    'POST',
    {
      password: passwordDiv.value
    }
  )
  // TODO check with server
  if (!resultPassword.valid) {
    displayMessage(false, 'Invalid project password')
    return
  }
  password = passwordDiv.value
  document.getElementById('passwordForm').hidden = true
  closeMessage()
  initTextEditor()
}

// Initialize text editor area
const initTextEditor = async () => {
  document.title = `LabeliT - Editor`
  if (!password) {
    document.getElementById('passwordForm').hidden = false
    return
  } else {
    document.getElementById('textForm').hidden = false
  }

  const url = decodeURI(window.location.href)
  const regex = /text\/(.*)$/
  textId = url.match(regex)[1]

  const result = await sendData(`/texts/${textId}/init`, 'POST', {
    password
  })
  // Place text
  text = result.content
  textEditiorDiv = document.getElementById('texteditor')
  textEditiorDiv.innerHTML = text

  // Create label menu
  const labels = result.categories
  const labelMenu = document.getElementById('labelmenu')
  let labelMenuHTML = ''
  labels.forEach(label => {
    labelMenuHTML += `<div class="labelButton"><button type="button" class="btn btn-${label.color}">${label.name} <span class="badge badge-light">${label.key}</span><span class="sr-only">key</span></button></div>
    `
  })
  labelMenu.innerHTML = labelMenuHTML

  // Set salt
  salt = result.salt
  // Init wordlist
  wordlist = []

  // Init key event listener
  document.addEventListener('keypress', event => {
    const selectedLabel = labels.find(element => {
      return element.charCode === event.charKey
    })
    if (selectedLabel) {
      addLabel(selectedLabel)
    }
  })
}

// Enables single click word selection
const clickWord = () => {
  const selection = window.getSelection()
  // Prevent error after auto click from removeLabel -> removeAllranges
  if (selection.anchorNode === null) return

  const node = selection.anchorNode
  const range = selection.getRangeAt(0)

  // Why??
  if (node.parentElement.className !== 'texteditor') return

  while (range.startOffset >= 0) {
    const firstChar = range.toString().charAt(0)
    if (
      firstChar === ' ' ||
      firstChar === ',' ||
      firstChar === '.' ||
      firstChar === ';' ||
      firstChar === ':' ||
      firstChar === '\n'
    ) {
      range.setStart(node, range.startOffset + 1)
      break
    }
    if (range.startOffset > 0) {
      range.setStart(node, range.startOffset - 1)
    } else {
      break
    }
  }

  while (range.endOffset <= text.length) {
    const lastChar = range.toString().slice(-1)
    if (
      lastChar === ' ' ||
      lastChar === ',' ||
      lastChar === '.' ||
      lastChar === ';' ||
      lastChar === ':' ||
      lastChar === '\n'
    ) {
      range.setEnd(node, range.endOffset - 1)
      break
    }
    if (range.endOffset < text.length) {
      range.setEnd(node, range.endOffset + 1)
    } else {
      break
    }
  }
}

// Adds label to selected text
const addLabel = label => {
  // Get selected text and delete text
  const highlight = window.getSelection()
  const selected = highlight.toString()
  const range = window.getSelection().getRangeAt(0)
  range.deleteContents()

  // Create elements for labeled area
  const span = document.createElement('span')
  span.classList.add('labeledarea')
  const spanLabel = span.appendChild(document.createElement('span'))
  spanLabel.classList.add('labeled')
  spanLabel.innerText = label.name
  spanLabel.style = 'background-color:' + label.colorHex
  const spanOriginal = span.appendChild(document.createElement('span'))
  spanOriginal.classList.add('originalWord')
  spanOriginal.hidden = true
  spanOriginal.innerText = selected
  const spanRemove = span.appendChild(document.createElement('span'))
  spanRemove.classList.add('removeInit')

  // Insert created element and remove selection
  range.insertNode(span)
  window.getSelection().removeAllRanges()

  // Replace other occurrences
  const confirmHTML =
    ' <span class="labeledarea"><span class="originalWord">' +
    selected +
    '</span><span class="confirmDivider"></span><span class="labeled" style="background-color:' +
    label.colorHex +
    '">' +
    label.name +
    '</span><span class="confirm" onclick="window.editor.confirmLabel(this)"></span><span class="remove" onclick="window.editor.removeLabel(this)"></span></span>'
  textEditiorDiv.innerHTML = textEditiorDiv.innerHTML.replace(
    new RegExp('((?!>).)\\b' + selected + '\\b', 'g'),
    confirmHTML
  )
  // Necessary since all previously set eventlisteners are remove during innerHTMLreplace
  // No working -> spanRemove.onclick = () => removeLabel(spanRemove)
  textEditiorDiv.innerHTML = textEditiorDiv.innerHTML.replace(
    new RegExp('<span class="removeInit"></span>', 'g'),
    '<span class="remove" onclick="window.editor.removeLabel(this)"></span>'
  )

  // Add word to wordlist
  wordlist.push({ hash: hashWord(selected), category: label.name })
}

const confirmLabel = element => {
  const parent = element.parentElement
  const divider = parent.getElementsByClassName('confirmDivider')[0]
  divider.remove()
  element.remove()
  parent.getElementsByClassName('originalWord')[0].hidden = true
  window.getSelection().removeAllRanges()
}

const removeLabel = element => {
  const parent = element.parentElement
  const originalWord = parent.getElementsByClassName('originalWord')[0]
    .innerText
  textEditiorDiv.insertBefore(document.createTextNode(originalWord), parent)
  parent.remove()
  textEditiorDiv.normalize()
  //window.getSelection().removeAllRanges()
}

const hashWord = word => {
  return new Hashes.SHA256().hex(word + salt)
}

const removeWord = word => {
  // TODO
}

const saveText = async () => {
  if (textEditiorDiv.innerHTML.includes('<span class="confirmDivider">')) {
    displayMessage(false, 'Can not save before all elements are confirmed')
    return
  }
  const result = await sendData('/texts', 'POST', {
    text: textEditiorDiv.innerText,
    htmlText: textEditiorDiv.innerHTML,
    textId: 1,
    projectName: 'test',
    user: 'admin',
    wordlist
  })
  if (result === true) {
    console.log('Text successfully saved')
  } else {
    console.log("Text couldn't be saved")
  }
}

const displayMessage = (success, message) => {
  const messageDiv = document.getElementById('message')
  if (success === true) {
    messageDiv.innerHTML = `<div class="alert alert-success" role="alert">${message}</div>`
  } else {
    messageDiv.innerHTML = `<div class="alert alert-danger" role="alert">${message}</div>`
  }
}

const closeMessage = () => {
  document.getElementById('message').hidden = true
}

export {
  saveText,
  removeLabel,
  confirmLabel,
  addLabel,
  clickWord,
  initTextEditor,
  submitPassword
}
