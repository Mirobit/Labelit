import { sendData, getData } from './api.js'

const projectId = 1

const initProjectSite = async () => {
  const result = await getData(`/projects/${projectId}`)
  if (result.status === true) {
    console.log('Project list loaded')
  } else {
    console.log('Project list could not be loaded')
  }

  document.getElementById('projectname').value = result.project.name
  document.getElementById('projectname').value = result.project.description

  const projectListHTML = ''
  result.projects.forEach(project => {
    projectListHTML += `<div class="card" style="width: 18rem;">
      <div class="card-body">
        <h5 class="card-title">${project.name}</h5>
        <h6 class="card-subtitle mb-2 text-muted">${project.totalTexts} texts</h6>
        <p class="card-text">${project.description}</p>
        <div class="progress">
          <div
            class="progress-bar bg-success"
            role="progressbar"
            style="width: ${project.progress}%;"
            aria-valuenow="${project.progress}"
            aria-valuemin="0"
            aria-valuemax="100"
          >
          ${project.progress}%
          </div>
        </div>
      </div>
    </div>`
  })
  projectList.innerHTML = projectListHTML
}

const updateProject = async element => {
  const result = await sendData(`/projects/${element.value}`, 'PUT', {
    name,
    description,
    filePath
  })
  if (result.status === true) {
    console.log('Project successfully updated')
  } else {
    console.log('Project could not be updated')
  }
}

const deleteProject = async element => {
  const result = await sendData(`/projects/${element.value}`, 'DELETE')
  if (result.status === true) {
    console.log('Project successfully delered')
  } else {
    console.log('Project cound not be deleted')
  }
}

const addCategory = async () => {}

export { initProjectSite, updateProject, deleteProject, addCategory }
