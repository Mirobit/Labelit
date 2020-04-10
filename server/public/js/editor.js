import { sendData } from './api.js'
import { switchPage } from './index.js'
import Store from './store.js'

// global vars
let textId, textEditiorDiv, categories, password
const projectId = '5e8e47c5af42a31378cea6b8'
const projectName = 'Test'
const newWords = []

// Initialize text editor area
const initTextPage = async (nextTextId) => {
  if (nextTextId === undefined) {
    document.title = `LabeliT - Editor`
    textEditiorDiv = document.getElementById('texteditor')
    document.addEventListener('keyup', handleEnterSave)

    const url = decodeURI(window.location.pathname)
    const regex = /text\/(.*)$/
    textId = url.match(regex)[1]
  } else {
    textId = nextTextId
    history.pushState(null, '', `/text/${textId}`)
    newWords.length = 0
  }

  const result = await sendData(`/texts/${textId}/load`, 'POST', {
    password,
  })
  console.log(result)

  // Place text
  if (result.status === true) {
    document.getElementById(
      'navPathHeader'
    ).innerHTML = `<a href="/projects/">Projects</a> > <a href="/projects/${projectName}">${projectName}</a> > ${result.textName}`
    textEditiorDiv.innerHTML = result.contentHtml
  } else {
    textEditiorDiv.innerHTML = ''
    document.getElementById(
      'navPathHeader'
    ).innerHTML = `<a href="/projects/">Projects</a> > <a href="/projects/${projectName}">${projectName}</a> > ${textId}`
    displayMessage(false, 'Could not load  text')
  }

  // Create label menu
  categories = result.categories
  const labelMenu = document.getElementById('labelmenu')
  let labelMenuHTML = ''
  categories.forEach((category) => {
    labelMenuHTML += `<div class="labelButton"><button type="button" class="btn btn-${category.color}" onclick="window.editor.addLabel('${category.key}')">${category.name} <span class="badge badge-light">${category.keyUp}</span><span class="sr-only">key</span></button></div>
    `
  })
  labelMenu.innerHTML = labelMenuHTML

  // Init key event listener
  document.addEventListener('keyup', (event) => addLabel(event.key))
}

// Enables single click word selection
const clickWord = () => {
  const selection = window.getSelection()
  // Prevent error after auto click from removeLabel -> removeAllranges
  if (selection.anchorNode === null) return

  const node = selection.anchorNode
  const range = selection.getRangeAt(0)
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

  while (range.endOffset <= node.length) {
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
    if (range.endOffset < node.length) {
      range.setEnd(node, range.endOffset + 1)
    } else {
      break
    }
  }
}

// TODO: remove keylistener when unmounted

const handleEnterSave = (event) => {
  if (event.key === 'Enter') updateText()
}

// Adds label to selected text
const addLabel = (key) => {
  const label = categories.find((category) => {
    return category.key === key
  })
  if (label === undefined) return
  // Get selected text
  const highlight = window.getSelection()

  // Check if invalid marking area
  if (
    highlight.anchorNode === null ||
    highlight.type === 'Caret' ||
    highlight.anchorNode.parentElement.className !== 'texteditor'
  ) {
    return
  }

  const selected = highlight.toString()

  // Delete text
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
    '<span class="labeledarea"><span class="originalWord">' +
    selected +
    '</span><span class="confirmDivider"></span><span class="labeled" style="background-color:' +
    label.colorHex +
    '">' +
    label.name +
    '</span><span class="confirm" onclick="window.editor.confirmLabel(this)"></span><span class="remove" onclick="window.editor.removeLabel(this)"></span></span>'
  textEditiorDiv.innerHTML = textEditiorDiv.innerHTML.replace(
    new RegExp('(?![^<]*>)\\b' + selected + '\\b((?!<\\/span))', 'g'),
    confirmHTML
  )
  // Necessary since all previously set eventlisteners are removed during innerHTMLreplace
  // No working -> spanRemove.onclick = () => removeLabel(spanRemove)
  textEditiorDiv.innerHTML = textEditiorDiv.innerHTML.replace(
    new RegExp('<span class="removeInit"></span>', 'g'),
    '<span class="remove" onclick="window.editor.removeLabel(this)"></span>'
  )

  // Add word to wordlist
  newWords.push({
    str: selected,
    category: label._id,
  })
}

const confirmLabel = (element) => {
  const parent = element.parentElement
  const divider = parent.getElementsByClassName('confirmDivider')[0]
  divider.remove()
  element.remove()
  parent.getElementsByClassName('originalWord')[0].hidden = true
  window.getSelection().removeAllRanges()
}

const removeLabel = (element) => {
  const parent = element.parentElement
  const originalWord = parent.getElementsByClassName('originalWord')[0]
    .innerText
  textEditiorDiv.insertBefore(document.createTextNode(originalWord), parent)
  parent.remove()
  textEditiorDiv.normalize()
  //window.getSelection().removeAllRanges()
}

const removeWord = (word) => {
  //newWords = newWords.filter(newWord => new.Word.hash !== hashWord(word))
  newWords = newWords.filter((newWord) => newWord.str !== word)
}

const updateText = async () => {
  if (textEditiorDiv.innerHTML.includes('<span class="confirmDivider">')) {
    displayMessage(false, 'Can not save before all elements are confirmed')
    return
  }
  const result = await sendData('/texts', 'PUT', {
    textRaw: textEditiorDiv.innerText,
    htmlText: textEditiorDiv.innerHTML,
    textId: textId,
    projectId: projectId,
    newWords,
    password,
  })
  if (result.status === true) {
    closeMessage()
    initTextEditor(result.nextTextId)
  } else {
    displayMessage(false, 'Could not update text')
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
  document.getElementById('message').innerHTML = ''
}

export {
  removeLabel,
  confirmLabel,
  addLabel,
  clickWord,
  initTextPage,
  updateText,
}
