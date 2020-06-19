import { sendData, getData } from '../api.js'
import { setNavPath, switchPage } from '../index.js'
import Store from '../store.js'
import { closeMessage, displayMessage } from '../components/message.js'

// global vars
let textId, textEditiorDiv, categories, classActive, contentArr
const newWords = []
let customMarking = false

// Initialize text editor area
const init = async (nextTextId) => {
  Store.currentClose = close
  closeMessage()

  if (nextTextId === undefined) {
    textEditiorDiv = document.getElementById('texteditor')

    const url = decodeURI(window.location.pathname)
    const regex = /text\/(.*)$/
    textId = url.match(regex)[1]
  } else {
    textId = nextTextId
    history.pushState(
      null,
      '',
      `/project/${encodeURI(Store.project.name)}/text/${textId}`
    )
    newWords.length = 0
  }
  const result = await sendData(`/texts/${textId}/load`, 'POST', {
    password: Store.password,
  })
  textPage.hidden = false
  // Place text
  if (result.status) {
    if (Store.project._id === undefined) {
      Store.project._id = result.projectId
    }
    classActive = result.classActive
    document.title = `Labelit - Text: ${result.textName}`
    setNavPath(close, Store.project.name, result.textName)
    contentArr = result.contentArr
    displayText()
  } else {
    document.title = `Labelit - Text: ${textId}`
    textEditiorDiv.innerHTML = ''
    setNavPath(close, 'Unknown', result.textId)
    return
  }

  // Create category menu
  categories = result.categories
  document.getElementById('categorymenu').innerHTML = categories.reduce(
    (outputHTML, category) =>
      outputHTML +
      `<div class="categoryButton"><button type="button" class="btn btn-${category.color} btn-sm" onclick="textFuncs.addLabel('${category.key}')">${category.name} <span class="badge badge-light">${category.keyUp}</span><span class="sr-only">key</span></button></div>
    `,
    '<div class="menuHeader">Categories</div>'
  )

  // Create classification menu
  if (classActive) {
    document.getElementById('classificationsmenu').hidden = false
    document.getElementById(
      'classificationsmenu'
    ).innerHTML = result.projectClassifications.reduce(
      (outputHTML, classification) =>
        outputHTML +
        `<div class="custom-control custom-checkbox mb-3">
        <input
          class="custom-control-input"
          name="classifications"
          id="classificationCheckbox${classification.name}"
          value="${classification._id}"
          type="checkbox"
          ${
            result.classifications.includes(classification._id) ? 'checked' : ''
          }
        /><label
          class="custom-control-label "
          for="classificationCheckbox${classification.name}"
          >${classification.name}</label
        >
      </div>`,
      '<div class="menuHeader">Classifications</div>'
    )
  }

  // Set show confirmed
  document.getElementById('showConfirmed').checked = result.showConfirmed

  // Init key event listener
  document.addEventListener('keyup', handleKeyPress)
  document.addEventListener('keydown', handleKeyPressDown)
}

const close = () => {
  Store.textPage.hidden = true
  document.getElementById('classificationsmenu').hidden = true
  document.removeEventListener('keyup', handleKeyPress)
}

const displayText = () => {
  const wrapper = document.createElement('span')
  for (let i = 0; i < contentArr.length; i++) {
    const entry = contentArr[i]
    if (entry.type === 'text') {
      const textSpan = wrapper.appendChild(document.createElement('span'))
      textSpan.id = i
      textSpan.innerText = entry.text
    } else {
      // Create elements for labeled area
      const labelSpan = wrapper.appendChild(document.createElement('span'))
      labelSpan.classList.add('labeledarea')
      const spanLabel = labelSpan.appendChild(document.createElement('span'))
      spanLabel.classList.add('labeled')
      spanLabel.title = entry.original
      spanLabel.innerText = entry.text
      spanLabel.id = i
      spanLabel.setAttribute('style', `background-color:${entry.colorHex}`)

      const spanRemove = labelSpan.appendChild(document.createElement('span'))
      spanRemove.classList.add('remove')
      spanRemove.onclick = function () {
        removeLabel(this)
      }
      if (entry.status === 'unconfirmed') {
        const confirmSpan = document.createElement('span')
        confirmSpan.classList.add('originalWord')
        confirmSpan.innerText = entry.original
        labelSpan.prepend(confirmSpan)

        const spanConfirm = labelSpan.appendChild(
          document.createElement('span')
        )
        spanConfirm.classList.add('confirm')
        spanConfirm.onclick = function () {
          confirmLabel(this)
        }
      }
    }
  }
  document.getElementById('texteditor').innerHTML = ''
  document.getElementById('texteditor').appendChild(wrapper)
}

// Enables single click word selection
const clickWord = () => {
  if (customMarking) return
  const selection = window.getSelection()
  // Prevent error after auto click from removeLabel -> removeAllranges
  if (selection.anchorNode === null) return

  const node = selection.anchorNode
  const range = selection.getRangeAt(0)

  // Prevent marking multiple nodes
  if (selection.anchorNode !== selection.focusNode) {
    range.setStart(node, selection.anchorOffset)
    range.setEnd(node, selection.anchorOffset + 1)
  }

  while (range.startOffset >= 0) {
    const firstChar = range.toString().charAt(0)
    if (
      firstChar === ' ' ||
      firstChar === ',' ||
      firstChar === '.' ||
      firstChar === ';' ||
      firstChar === ':' ||
      firstChar === '\n' ||
      firstChar === '\r' ||
      firstChar === '\r\n'
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

// Necessary to use removeEventListener
const handleKeyPress = (event) => {
  if (event.key === 'Enter') updateText()
  else if (event.key === 'ArrowRight') getNextText()
  else if (event.key === 'ArrowLeft') getNextText(true)
  else if (event.key === 'Control') customMarking = false
  else addLabel(event.key)
}

const handleKeyPressDown = (event) => {
  if (event.key === 'Control') customMarking = true
}

// Adds label to selected text
const addLabel = (key) => {
  const label = categories.find((category) => {
    return category.key === key
  })
  if (label === undefined) return
  // Get selected text
  const marked = window.getSelection()
  // Check if invalid marking area
  if (
    marked.anchorNode === null ||
    marked.type === 'Caret' ||
    marked.anchorNode.parentElement.parentNode.parentNode.className !==
      'texteditor'
  ) {
    return
  }

  const selected = marked.toString()
  const range = window.getSelection().getRangeAt(0)

  // range.deleteContents()
  const arrayIndex = parseInt(marked.anchorNode.parentNode.id)
  const regex = new RegExp('\\b' + selected + '\\b', 'i')
  const index = contentArr[arrayIndex].text.search(regex)
  replaceEntry(
    arrayIndex,
    index,
    index + selected.length,
    selected,
    label,
    'confirmed'
  )
  replaceMore(selected, label)
  displayText()

  // Add word to wordlist
  newWords.push({
    str: selected,
    category: label._id,
  })
}

const replaceMore = (word, label) => {
  let outerActive = true
  const regex = new RegExp('\\b' + word + '\\b', 'i')
  let i = 0
  while (outerActive) {
    if (i > contentArr.length - 1) break
    if (contentArr[i].type === 'label') {
      i++
      continue
    }
    let innerActive = true

    while (innerActive) {
      const index = contentArr[i].text.search(regex)
      if (index === -1) break
      replaceEntry(i, index, index + word.length, word, label, 'unconfirmed')
    }
    i++
  }
}

const replaceEntry = (index, start, end, word, label, status) => {
  const text = contentArr[index]
  let firstPart = text.text.slice(0, start)
  let lastPart = text.text.slice(end)

  contentArr.splice(index, 1, {
    text: label.name,
    original: word,
    id: label._id,
    colorHex: label.colorHex,
    status,
  })

  if (end <= text.text.length - 1) {
    'lastparrt',
      contentArr.splice(index + 1, 0, {
        text: lastPart,
        type: 'text',
      })
  }

  if (start > 0) {
    contentArr.splice(index, 0, {
      text: firstPart,
      type: 'text',
    })
  }
}

const confirmLabel = (element) => {
  const arrIndex = parseInt(element.previousSibling.previousSibling.id)
  contentArr[arrIndex].status = 'confirmed'
  displayText()
}

const removeLabel = (element) => {
  const arrIndex = parseInt(element.previousSibling.id)
  const text = contentArr[arrIndex].original
  let textBefore = ''
  let textAfter = ''
  let newIndexStart = arrIndex
  let steps = 1

  if (arrIndex > 0 && contentArr[arrIndex - 1].type === 'text') {
    textBefore = contentArr[arrIndex - 1].text
    newIndexStart--
    steps++
  }
  if (
    arrIndex < contentArr.length - 1 &&
    contentArr[arrIndex + 1].type === 'text'
  ) {
    textAfter = contentArr[arrIndex + 1].text
    steps++
  }

  const newText = textBefore + text + textAfter

  contentArr.splice(newIndexStart, steps, {
    text: newText,
    type: 'text',
  })

  displayText()
}

const getNextText = async (prev = false) => {
  const showConfirmed = document.getElementById('showConfirmed').checked
  const result = await getData(
    `/texts/next/${textId}/${Store.project._id}/${showConfirmed}/${prev}`
  )

  if (result.status !== 200) {
    return
  }

  if (result.textId) init(result.textId)
  else switchPage(close, `/project/${encodeURI(Store.project.name)}`)
}

const updateText = async () => {
  if (textEditiorDiv.innerHTML.includes('<span class="confirm">')) {
    displayMessage(false, 'Can not save before all elements are confirmed')
    return
  }

  const classList = document
    .getElementById('classificationsmenu')
    .querySelectorAll('input[type=checkbox]:checked')
  if (classActive && classList.length === 0) {
    displayMessage(false, 'Please select at least one classification')
    return
  }

  // Array with selected classifications
  const classArr = []
  for (let i = 0; i < classList.length; i++) {
    classArr.push(classList[i].value)
  }

  const result = await sendData(`/texts/${textId}`, 'PUT', {
    contentArr,
    projectId: Store.project._id,
    newWords,
    password: Store.password,
    classifications: classArr,
  })
  if (result.status) {
    displayMessage(true, 'Text saved')
  }
}

const changeShowConfirmed = async (element) => {
  const result = await sendData(`/projects/${Store.project._id}`, 'PUT', {
    showConfirmed: element.checked,
  })

  if (result.status !== 200) {
    return
  }

  Store.project.showConfirmed = element.checked
}

export {
  removeLabel,
  confirmLabel,
  addLabel,
  clickWord,
  init,
  updateText,
  getNextText,
  changeShowConfirmed,
}
