import { sendData, getData } from './api.js'

const initProjectList = async () => {
  console.log('init projectlist')
  const result = await getData('/projects')
  if (result.status !== true) {
    displayMessage(result.status, 'Could not load project list')
  }

  const projectList = document.getElementById('projectlist')
  let projectListHTML = ''
  result.projects.forEach((project) => {
    const nameURI = encodeURI(project.name)
    projectListHTML += `<div class="card projectcard shadow" style="width: 20rem;">
    <div class="card-body">
      <h5 class="card-title"><a href="/projects/${nameURI}">${project.name}</a></h5>
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
}

const createProject = async () => {
  const name = document.getElementById('name').value
  const description = document.getElementById('description').value
  const folderPath = document.getElementById('folderPath').value
  const passwordEl = document.getElementById('password')
  const passwordRepeatEl = document.getElementById('passwordRepeat')

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
    password: password.value,
  })
  if (result.status === true) {
    document.getElementById('name').value = ''
    document.getElementById('description').value = ''
    document.getElementById('folderPath').value = ''
    document.getElementById('password').value = ''
    document.getElementById('passwordRepeat').value = ''
    initProjectList()
    displayMessage(result.status, 'Project successfully created')
  } else {
    displayMessage(result.status, 'Could not create project')
  }
}

const displayMessage = (status, message) => {
  const messageDiv = document.getElementById('message')
  if (status === true) {
    messageDiv.innerHTML = `<div class="alert alert-success" role="alert">${message}</div>`
  } else {
    messageDiv.innerHTML = `<div class="alert alert-danger" role="alert">${message}</div>`
  }
}

export { createProject, initProjectList }
