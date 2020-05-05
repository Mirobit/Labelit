import { sendData, getData } from '../api.js'
import { switchPage, setNavPath } from '../index.js'
import Store from '../store.js'
import { displayMessage } from '../components/message.js'

let projects = []

const init = async () => {
  document.title = `Labelit - Projects`
  Store.password = ''
  Store.project = {}
  setNavPath(close)
  const result = await getData('/projects')
  if (!result.status) {
    return
  }
  const projectList = document.getElementById('projectlist')
  let projectListHTML = ''
  projects = result.projects
  result.projects.forEach((project) => {
    projectListHTML += `<div class="card projectcard shadow" style="width: 20rem;">
    <div class="card-body">
      <h5 class="card-title"><span class="link" onclick="homeFuncs.openProject('${project.name}')">${project.name}</span></h5>
      <h6 class="card-subtitle mb-2 text-muted">${project.textCount} texts</h6>
      <p class="card-text">${project.description}</p>
      <div class="progress-percentage"><span>${project.progress}%</span></div>
      <div class="progress">
        <div class="progress-bar" style="width: ${project.progress}%;" role="progressbar" aria-valuenow="${project.progress}" aria-valuemin="0" aria-valuemax="100"></div>
      </div>
      </div>
    </div>
  </div>`
  })
  projectList.innerHTML = projectListHTML
  homePage.hidden = false
}

const close = () => {
  Store.homePage.hidden = true
}

const openProject = (projectName) => {
  switchPage(close, `/project/${encodeURI(projectName)}`)
}

const createProject = async () => {
  const name = document.getElementById('nameNew').value
  const description = document.getElementById('descriptionNew').value
  const classification = document.getElementById('classificationNew').checked
  const passwordEl = document.getElementById('passwordNew')
  const passwordRepeatEl = document.getElementById('passwordRepeatNew')
  const folderPath = document.getElementById('folderPathNew').value

  if (passwordEl.value !== passwordRepeatEl.value) {
    passwordEl.classList.add('is-invalid')
    passwordRepeatEl.classList.add('is-invalid')
    displayMessage(false, 'Passwords not the same')
    return
  }

  // Remove invalid styling
  if (passwordEl.classList.contains('is-invalid')) {
    passwordEl.classList.remove('is-invalid')
    passwordRepeatEl.classList.remove('is-invalid')
  }

  const result = await sendData('/projects', 'POST', {
    name,
    description,
    folderPath,
    password: passwordEl.value,
    classification,
  })

  if (!result.status) {
    return
  }

  document.getElementById('nameNew').value = ''
  document.getElementById('descriptionNew').value = ''
  document.getElementById('passwordNew').value = ''
  document.getElementById('passwordRepeatNew').value = ''
  document.getElementById('folderPathNew').value = ''
  document.getElementById('classificationNew').checked = false
  init()
  displayMessage(true, 'Project successfully created')
}

// const uploadProject = async () => {
//   const myfiles = document.getElementById('myfile').files
//   console.log(myfiles)
//   const myFormData = new FormData()
//   for (let i = 0; i < myfiles.length; i++) {
//     myFormData.append(myfiles[i].name, myfiles[i])
//   }

//   console.log(myFormData)

//   const url = window.location.origin
//   const options = {
//     method: 'POST',
//     body: myFormData,
//   }
//   const response = await fetch(window.location.origin + '/api/upload', options)

//   console.log(response)
// }

export { createProject, init, openProject }
