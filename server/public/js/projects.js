import { sendData, getData } from './api.js'

const initProjectList = async () => {
  const result = await getData('/projects')
  console.log(result)
  if (result.status === true) {
    console.log('Project list loaded')
  } else {
    console.log('Project list could not be loaded')
  }

  const projectList = document.getElementById('projectlist')
  let projectListHTML = ''
  result.projects.forEach(project => {
    projectListHTML += `<div class="card projectcard" style="width: 18rem;">
    <div class="card-body">
      <h5 class="card-title">${project.name}</h5>
      <h6 class="card-subtitle mb-2 text-muted">${project.textCount} texts</h6>
      <p class="card-text">${project.description}</p>
      <div class="progress">
        <div
          class="progress-bar bg-success"
          role="progressbar"
          style="width: ${project.textUpdatedCount}%;"
          aria-valuenow="${project.textUpdatedCount}"
          aria-valuemin="0"
          aria-valuemax="100"
        >
        ${project.textUpdatedCount}%
        </div>
      </div>
    </div>
  </div>`
  })
  projectList.innerHTML = projectListHTML
}

const createProject = async () => {
  const name = document.getElementById('projectname').value
  const description = document.getElementById('projectdescription').value
  const filePath = document.getElementById('filePath').value

  const result = await sendData('/projects', 'POST', {
    name,
    description,
    filePath,
    textCount: 111
  })
  if (result.status === true) {
    console.log('Project successfully created')
    document.getElementById('projectname').value = ''
    document.getElementById('projectdescription').value = ''
    document.getElementById('filePath').value = ''
    document.getElementsByClassName('custom-file-label')[0].innerText =
      'Choose File'
    initProjectList()
  } else {
    console.log("Project couldn't be created")
  }
}

export { createProject, initProjectList }
