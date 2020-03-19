var text = "there Far far away, behind the word mountains, far from countries Vokalia the there and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the, coast of the Semantics, a large language ocean. A small river named Duden flows by their place and supplies it with the necessary regelialia."
// text = "<span>" + text
// text = text.replace(" ", "</span> <span>")
const textEditiorDiv = document.getElementById("texteditor")
textEditiorDiv.innerHTML = text

labels = [
  {
    keyCode: 80,
    keyString: "P",
    name: "Person",
    color: "primary",
    colorHex: "#007BFF",
  },
  {
    keyCode: 87,
    keyString: "W",
    name: "Place",
    color: "info",
    colorHex: "#17A2B8",
  },
  {
    keyCode: 67,
    keyString: "C",
    name: "Company",
    color: "secondary",
    colorHex: "#6C757D",
  },
  {
    keyCode: 79,
    keyString: "o",
    name: "Other",
    color: "dark",
    colorHex: "#343A40",
  }
]

document.addEventListener('keydown', (event) => {
  const selectedLabel = labels.find(element => element.keyCode === event.keyCode)
  if(selectedLabel) {
    addLable(selectedLabel)
  } 
})

// Enables single click word selection
function clickWord() {
  selection = window.getSelection()
  var range = selection.getRangeAt(0)
  var node = selection.anchorNode
  if(node.parentElement.className !== "texteditor") return

  while(range.startOffset > 0 ) {
    range.setStart(node, range.startOffset -1)
    if(range.toString().indexOf(' ') == 0){
      range.setStart(node, range.startOffset +1)
      break
    }
  }
  while(range.endOffset <= text.length) {
    console.log("end while start",range.endOffset)
    range.setEnd(node, range.endOffset + 1)
    console.log("end while next",range.endOffset)
    const newChar = range.toString().slice(-1)
    if(newChar === ' ' || newChar === ',' || newChar === '.' || newChar === ';' || newChar === ':'){
      range.setEnd(node, range.endOffset - 1)
      break
    }
  }
}

// Adds lable to selected text
function addLable(label) {
    var highlight = window.getSelection()
    var selected = highlight.toString().trim()

    range = window.getSelection().getRangeAt(0)
    // TODO check if trim
    range.deleteContents()

    // Create elements for labeled area
    var span = document.createElement("span")
    span.classList.add("labeledarea")
    var spanLabel = span.appendChild(document.createElement('span'))
    spanLabel.classList.add("labeled")
    spanLabel.innerText = label.name
    spanLabel.style= 'background-color:'+ label.colorHex
    var spanOriginal = span.appendChild(document.createElement('span'))
    spanOriginal.hidden = true
    spanOriginal.innerText = selected
    var spanRemove = span.appendChild(document.createElement('span'))
    spanRemove.classList.add("remove")
    spanRemove.innerText = "x"
    spanRemove.onclick = () => removeLable(span)
    //spanRemove.addEventListener("click", "removeLable(this)"); 

    range.insertNode(span)
    window.getSelection().removeAllRanges()

    var selectedHTML = '<span class="labeledarea"><span class="labled" style="background-color:'+ label.colorHex + '">' + label.name + '</span><span hidden>' + selected + '</span><span class="remove" onclick="removeLable(this)">x</span></span>'
    
    // text.innerHTML = text.innerHTML.replace(new RegExp('\\b' + selected + '\\b', 'g'), selected)
    addLabelsGlobal(label.name, selected)
  }

function addLabelsGlobal(labelname, selected) {
    var confirmHTML = '<span class="labledarea"><span class="labled">' + labelname + '</span><span class="originalWord">' + selected + '</span><span class="confirm" onclick="confirmLable(this)">c</span> <span class="remove" onclick="removeLable(this)">x</span></span>'
    textEditiorDiv.innerHTML = textEditiorDiv.innerHTML.replace(new RegExp('\\b' + selected + '\\b', 'g'), confirmHTML)
}

function removeLabel(element) {
  var orgWord = element.childNodes[1].innerText
  textEditiorDiv.insertBefore(document.createTextNode(orgWord), element)
  element.remove()
   // window.getSelection().removeAllRanges()
  }

