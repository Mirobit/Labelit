document.addEventListener('keyup', (e) => {
    addLable("Person")
})
var text = "there Far far away, behind the word mountains, far from countries Vokalia the there and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the, coast of the Semantics, a large language ocean. A small river named Duden flows by their place and supplies it with the necessary regelialia."
// text = "<span>" + text
// text = text.replace(" ", "</span> <span>")
document.getElementById("texteditor").innerHTML = text

function clickWord() {
  // selection = window.getSelection()
  // var range = selection.getRangeAt(0)
  // var node = selection.anchorNode
  // while(range.startOffset > 0 ) {
  //   range.setStart(node, range.startOffset -1)
  //   if(range.toString().indexOf(' ') == 0){
  //     range.setStart(node, range.startOffset +1)
  //     break
  //   }
  // }
  // while(range.endOffset < 30 ) {
  //   range.setEnd(node, range.EndOffset +1)
  //   console.log(range)
  //   if(range.toString().indexOf(' ') != -1){
  //     range.setEnd(node, range.endOffset -1)
  //     break
  //   }
  // }


  //console.log(range)
}

function addLable(category) {
    var lablename = category
    var highlight = window.getSelection()
    var selected = highlight.toString().trim()
    var text = document.getElementById("texteditor")

    range = window.getSelection().getRangeAt(0)
    // TODO check if trim
    range.deleteContents()

    // Create elements for labled area
    var span = document.createElement("span")
    span.classList.add("labledarea")
    var spanLabel = span.appendChild(document.createElement('span'))
    spanLabel.classList.add("labled")
    spanLabel.innerText = lablename
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

    var selectedHTML = '<span class="labledarea"><span class="labled">' + lablename + '</span><span hidden>' + selected + '</span><span class="remove" onclick="removeLable(this)">x</span></span>'
    console.log(selectedHTML)
    
   // text.innerHTML = text.innerHTML.replace(new RegExp('\\b' + selected + '\\b', 'g'), selected)
    addLablesGlobal(lablename, selected, text)
  }

function addLablesGlobal(lablename, selected, text) {
    var confirmHTML = '<span class="labledarea"><span class="labled">' + lablename + '</span><span class="originalWord">' + selected + '</span><span class="confirm" onclick="confirmLable(this)">c</span> <span class="remove" onclick="removeLable(this)">x</span></span>'
    text.innerHTML = text.innerHTML.replace(new RegExp('\\b' + selected + '\\b', 'g'), confirmHTML)
}

function removeLable(element) {

  var text = document.getElementById("texteditor")
    var orgWord = element.childNodes[1].innerText
    console.log(orgWord)
    text.insertBefore(document.createTextNode(orgWord), element)
    element.remove()
   // window.getSelection().removeAllRanges()

  }

