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
      `<button type="button" class="btn btn-${
        category.color
      }" onclick="window.editCategory('${category._id}')">${
        category.name
      } <span class="badge badge-light">${category.key.toUpperCase()}</span><span class="sr-only">key</span>

      
    </button><span hidden>${
      category._id
    }</span><span onclick="window.removeCategory('${
        category._id
      }')">&times;</span>
    `
    )
  }, '')
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

const removeProject = async element => {
  const result = await sendData(`/projects/${element.value}`, 'DELETE')
  if (result.status === true) {
    displayMessage(result.status, 'Project successfully removed')
  } else {
    displayMessage(result.status, 'Could not remove project')
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
    displayMessage(result.status, 'Could not create add category')
  }
}

const editCategory = async categoryId => {
  const category = project.categories.find(
    category => category._id === categoryId
  )
  const button = document.getElementById('submitCategory')
  document.getElementById('categoryName').value = category.name
  document.getElementById('categoryKey').value = category.key
  document.getElementById('categoryColor').value = category.color
  button.innerText = 'Update Category'
  button.onclick = () => window.updateCategory(categoryId)
}

const updateCategory = async categoryId => {
  console.log('updating')
  const categoryNameEl = document.getElementById('categoryName')
  const categoryKeyEl = document.getElementById('categoryKey')
  const categoryColorEl = document.getElementById('categoryColor')

  const result = await sendData(
    `/projects/${project._id}/categories/${categoryId}`,
    'PUT',
    {
      name: categoryNameEl.value,
      key: categoryKeyEl.value,
      keyCode: categoryKeyEl.value.charCodeAt(),
      color: categoryColorEl.value
    }
  )
  if (result.status === true) {
    initProject()
    categoryNameEl.value = ''
    categoryKeyEl.value = ''
    categoryColorEl.value = ''
    const button = document.getElementById('submitCategory')
    button.innerText = 'Add Category'
    button.onclick = window.addCategory
    displayMessage(result.status, 'Category successfully updated')
  } else {
    displayMessage(result.status, 'Could not create update category')
  }
}

const removeCategory = async categoryId => {
  const result = await sendData(
    `/projects/${project._id}/categories/${categoryId}`,
    'DELETE'
  )
  if (result.status === true) {
    initProject()
    displayMessage(result.status, 'Category successfully removed')
  } else {
    displayMessage(result.status, 'Could not remove Category')
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

export {
  initProject,
  updateProject,
  removeProject,
  addCategory,
  editCategory,
  updateCategory,
  removeCategory
}
