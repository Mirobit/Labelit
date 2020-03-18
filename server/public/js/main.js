var text = "there Far far away, behind the word mountains, far from countries Vokalia the there and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the, coast of the Semantics, a large language ocean. A small river named Duden flows by their place and supplies it with the necessary regelialia."
// text = "<span>" + text
// text = text.replace(" ", "</span> <span>")
document.getElementById("texteditor").innerHTML = text

labels = [
  {
    keyCode: 80,
    keyString: "P",
    name: "Person",
    color: "primary",
    colorHex: "#0069D9",
  },
  {
    keyCode: 87,
    keyString: "W",
    name: "Place",
    color: "info",
    colorHex: "#138496",
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
    colorHex: "#23272B",
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
  while(range.startOffset > 0 ) {
    range.setStart(node, range.startOffset -1)
    if(range.toString().indexOf(' ') == 0){
      range.setStart(node, range.startOffset +1)
      break
    }
  }
  while(range.endOffset <= text.length) {
    range.setEnd(node, range.endOffset + 1)
    if(range.toString().indexOf(' ') != -1 || range.toString().indexOf(',') != -1 || range.toString().indexOf('.') != -1 || range.toString().indexOf(';') != -1 || range.toString().indexOf(':') != -1){
      range.setEnd(node, range.endOffset - 1)
      break
    }
  }
}

// Adds lable to selected text
function addLable(label) {
    var highlight = window.getSelection()
    var selected = highlight.toString().trim()
    //var text = document.getElementById("texteditor")

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

    console.log(span)
    range.insertNode(span)
    console.log(range)
    window.getSelection().removeAllRanges()

    var selectedHTML = '<span class="labeledarea"><span class="labled" style="background-color:'+ label.colorHex + '">' + label.name + '</span><span hidden>' + selected + '</span><span class="remove" onclick="removeLable(this)">x</span></span>'
    console.log(selectedHTML)
    
   // text.innerHTML = text.innerHTML.replace(new RegExp('\\b' + selected + '\\b', 'g'), selected)
    //addLabelsGlobal(label.name, selected, text)
  }

function addLabelsGlobal(labelname, selected, text) {
    var confirmHTML = '<span class="labledarea"><span class="labled">' + labelname + '</span><span class="originalWord">' + selected + '</span><span class="confirm" onclick="confirmLable(this)">c</span> <span class="remove" onclick="removeLable(this)">x</span></span>'
    text.innerHTML = text.innerHTML.replace(new RegExp('\\b' + selected + '\\b', 'g'), confirmHTML)
}

function removeLabel(element) {
  var text = document.getElementById("texteditor")
  var orgWord = element.childNodes[1].innerText
  console.log(orgWord)
  text.insertBefore(document.createTextNode(orgWord), element)
  element.remove()
   // window.getSelection().removeAllRanges()
  }

