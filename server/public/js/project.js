import { sendData, getData } from './api.js'

let project

const initProject = async () => {
  const url = decodeURI(window.location.href)
  const regex = /projects\/(.*)$/
  const projectName = url.match(regex)[1]
  document.title = `LabeliT - ${projectName}`

  const result = await getData(`/projects/${projectName}`)
  if (result.status === true) {
    console.log('Project loaded')
  } else {
    console.log('Project could not be loaded')
    return
  }
  project = result.project

  document.getElementById('projectName').innerText = project.name
  document.getElementById('projectDescription').innerText = project.description
  document.getElementById('projectProgress').innerHTML = `<div
    class="progress-bar bg-success"
    role="progressbar"
    style="width: ${project.process}%;"
    aria-valuenow="${project.process}"
    aria-valuemin="0"
    aria-valuemax="100"
  >${project.process}%
  </div>`

  document.getElementById(
    'projectCategories'
  ).innerHTML = project.categories.reduce((outputHTML, category) => {
    return (
      outputHTML +
      `<button type="button" class="btn btn-${category.color}">${
        category.name
      } <span class="badge badge-light">${category.key.toUpperCase()}</span><span class="sr-only">key</span>

      
    </button><span hidden>${
      category._id
    }</span><span onlick="window.removeCategory(this)">&times;</span>
    `
    )
  }, '')

  // const projectListHTML = ''
  // result.projects.forEach(project => {
  //   projectListHTML += `<div class="card" style="width: 18rem;">
  //     <div class="card-body">
  //       <h5 class="card-title">${project.name}</h5>
  //       <h6 class="card-subtitle mb-2 text-muted">${project.totalTexts} texts</h6>
  //       <p class="card-text">${project.description}</p>
  //       <div class="progress">
  //         <div
  //           class="progress-bar bg-success"
  //           role="progressbar"
  //           style="width: ${project.progress}%;"
  //           aria-valuenow="${project.progress}"
  //           aria-valuemin="0"
  //           aria-valuemax="100"
  //         >
  //         ${project.progress}%
  //         </div>
  //       </div>
  //     </div>
  //   </div>`
  // })
  // projectList.innerHTML = projectListHTML
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

const addCategory = async () => {
  const categoryNameEl = document.getElementById('categoryName')
  const categoryKeyEl = document.getElementById('categoryKey')
  const categoryColorEl = document.getElementById('categoryColor')

  const result = await sendData(`/projects/${project._id}/categories`, 'POST', {
    name: categoryNameEl.value,
    key: categoryKeyEl.value,
    keyCode: categoryKeyEl.value.charCodeAt(),
    color: categoryColorEl.value
  })
  if (result.status === true) {
    categoryNameEl.value = ''
    categoryKeyEl.value = ''
    categoryColorEl.value = ''
    initProject()
    displayMessage(result.status, 'Category successfully added')
  } else {
    displayMessage(result.status, 'Could not create add Category')
  }
}

const removeCategory = element => {
  // TODO
}

const displayMessage = (status, message) => {
  const messageDiv = document.getElementById('message')
  if (status === true) {
    messageDiv.innerHTML = `<div class="alert alert-success" role="alert">${message}</div>`
  } else {
    messageDiv.innerHTML = `<div class="alert alert-danger" role="alert">${message}</div>`
  }
}

export { initProject, updateProject, deleteProject, addCategory }
