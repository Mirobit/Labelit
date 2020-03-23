var text =
  '.there Far far away, behind the word mountains, far from countries Vokalia the there and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the, coast of the Semantics, a large language ocean. A small river named Duden flows by their place and supplies it with the necessary regelialia.'
const textEditiorDiv = document.getElementById('texteditor')
textEditiorDiv.innerHTML = text

const initLabels = () => {
  labels = [
    {
      keyCode: 80,
      keyString: 'P',
      name: 'Person',
      color: 'primary',
      colorHex: '#007BFF'
    },
    {
      keyCode: 87,
      keyString: 'W',
      name: 'Place',
      color: 'info',
      colorHex: '#17A2B8'
    },
    {
      keyCode: 67,
      keyString: 'C',
      name: 'Company',
      color: 'secondary',
      colorHex: '#6C757D'
    },
    {
      keyCode: 79,
      keyString: 'O',
      name: 'Other',
      color: 'dark',
      colorHex: '#343A40'
    }
  ]

  const labelMenu = document.getElementById('labelmenu')
  let labelMenuHTML = ''
  labels.forEach(label => {
    labelMenuHTML += `<div class="labelButton"><button type="button" class="btn btn-${label.color}">${label.name} <span class="badge badge-light">${label.keyString}</span><span class="sr-only">key</span></button></div>
    `
  })
  labelMenu.innerHTML = labelMenuHTML

  document.addEventListener('keydown', event => {
    const selectedLabel = labels.find(
      element => element.keyCode === event.keyCode
    )
    if (selectedLabel) {
      addLable(selectedLabel)
    }
  })
}

initLabels()

// Enables single click word selection
function clickWord() {
  selection = window.getSelection()
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
      firstChar === ':'
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
      lastChar === ':'
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

// Adds lable to selected text
function addLable(label) {
  // Get selected text and delete text
  var highlight = window.getSelection()
  var selected = highlight.toString()
  range = window.getSelection().getRangeAt(0)
  range.deleteContents()

  // Create elements for labeled area
  var span = document.createElement('span')
  span.classList.add('labeledarea')
  var spanLabel = span.appendChild(document.createElement('span'))
  spanLabel.classList.add('labeled')
  spanLabel.innerText = label.name
  spanLabel.style = 'background-color:' + label.colorHex
  var spanOriginal = span.appendChild(document.createElement('span'))
  spanOriginal.classList.add('originalWord')
  spanOriginal.hidden = true
  spanOriginal.innerText = selected
  var spanRemove = span.appendChild(document.createElement('span'))
  spanRemove.classList.add('removeInit')

  // Insert created element and remove selection
  range.insertNode(span)
  window.getSelection().removeAllRanges()

  // Replace other occurrences
  addLabelsGlobal(label.name, label.colorHex, selected, spanRemove, span)

  // No working, see comment in addLabelsGlobal
  //spanRemove.onclick = () => removeLabel(spanRemove)
}

function addLabelsGlobal(labelName, labelColor, selected) {
  const confirmHTML =
    ' <span class="labeledarea"><span class="originalWord">' +
    selected +
    '</span><span class="confirmDivider"></span><span class="labeled" style="background-color:' +
    labelColor +
    '">' +
    labelName +
    '</span><span class="confirm" onclick="confirmLabel(this)"></span><span class="remove" onclick="removeLabel(this)"></span></span>'
  textEditiorDiv.innerHTML = textEditiorDiv.innerHTML.replace(
    new RegExp('((?!>).)\\b' + selected + '\\b', 'g'),
    confirmHTML
  )
  // Necessary since all previously set eventlisteners are remove during innerHTMLreplace
  textEditiorDiv.innerHTML = textEditiorDiv.innerHTML.replace(
    new RegExp('<span class="removeInit"></span>', 'g'),
    '<span class="remove" onclick="removeLabel(this)"></span>'
  )
}

function confirmLabel(element) {
  const parent = element.parentElement
  const divider = parent.getElementsByClassName('confirmDivider')[0]
  divider.remove()
  element.remove()
  parent.getElementsByClassName('originalWord')[0].hidden = true
  window.getSelection().removeAllRanges()
}

function removeLabel(element) {
  const parent = element.parentElement
  const originalWord = parent.getElementsByClassName('originalWord')[0]
    .innerText
  textEditiorDiv.insertBefore(document.createTextNode(originalWord), parent)
  parent.remove()
  textEditiorDiv.normalize()
  //window.getSelection().removeAllRanges()
}
