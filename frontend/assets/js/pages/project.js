import { sendData, getData } from '../api.js'
import { switchPage, setNavPath } from '../index.js'
import Store from '../store.js'
import { displayMessage } from '../components/message.js'

const init = async () => {
  Store.projectPage.hidden = false
  const projectName = window.location.pathname.match(/^\/project\/(.{1,})$/)[1]

  const result = await getData(`/projects/${projectName}`)
  if (result.status !== true) {
    document.title = `Labelit - Project`
    setNavPath(close, projectName)
    displayMessage(result.status, 'Project could not be loaded')
    return
  }
  // Main
  Store.project = result.project
  document.title = `Labelit - Project: ${Store.project.name}`
  setNavPath(close, Store.project.name)

  // Texts
  document.getElementById('texts').innerHTML = Store.project.texts.reduce(
    (outputHTML, text) => {
      let status = ''
      if (text.status === 'confirmed')
        status = '<span class="confirmed"></span>'
      else if (text.status === 'unconfirmed')
        status = '<span class="unconfirmed"></span>'
      return (
        outputHTML +
        `<div><span class="link" onclick="projectFuncs.openText('${text._id}')">${text.name}</span>${status}</div>
    `
      )
    },
    ''
  )

  // Information
  document.getElementById('projectDescription').innerText =
    Store.project.description
  document.getElementById(
    'projectProgress'
  ).innerHTML = ` <div class="progress-percentage"><span>${Store.project.progress}%</span></div>
  <div class="progress">
    <div class="progress-bar" style="width: ${Store.project.progress}%;" role="progressbar" aria-valuenow="${Store.project.progress}" aria-valuemin="0" aria-valuemax="100"></div>
  </div>`

  // Categories
  let categoryMenuHTML = 'No categories'
  if (Store.project.categories.length > 0) {
    categoryMenuHTML = Store.project.categories.reduce(
      (outputHTML, category) =>
        outputHTML +
        `<button type="button" class="btn btn-${category.color} btn-sm" onclick="projectFuncs.showEditCategory('${category._id}', this)">${category.name} <span class="badge badge-light">${category.keyUp}</span><span class="sr-only">key</span>
    </button><span class="remove middle" onclick="projectFuncs.removeCategory('${category._id}')" hidden></span>
    `,
      ''
    )
  }
  document.getElementById('projectCategories').innerHTML = categoryMenuHTML

  // Classifications
  if (Store.project.classActive) {
    document.getElementById('classifications').hidden = false
    let classificationMenuHTML = 'No classifications'
    if (Store.project.classifications.length > 0) {
      classificationMenuHTML = Store.project.classifications.reduce(
        (outputHTML, classification) =>
          outputHTML +
          `<button type="button" class="btn btn-secondary btn-sm" onclick="projectFuncs.showEditClassification('${classification._id}', this)">${classification.name} <span class="sr-only">key</span>
      </button><span class="remove middle" onclick="projectFuncs.removeClassification('${classification._id}')" hidden></span>
      `,
        ''
      )
    }
    document.getElementById(
      'projectClassifications'
    ).innerHTML = classificationMenuHTML
  }
}

const close = () => {
  Store.projectPage.hidden = true
  document.getElementById('classifications').hidden = true
  document.getElementById('exportPath').value = ''
}

const openText = (textId) => {
  switchPage(close, `/project/${encodeURI(Store.project.name)}/text/${textId}`)
}

const updateProject = async () => {
  const newProjectName = document.getElementById('projectNameInput').value

  const result = await sendData(`/projects/${Store.project._id}`, 'PUT', {
    name: newProjectName,
    description: document.getElementById('projectDescriptionInput').value,
  })
  if (result.status === true) {
    document.getElementById('projectForm').hidden = true
    history.pushState(null, '', `/projects/${newProjectName}`)
    init()
    displayMessage(result.status, 'Project successfully updated')
  } else {
    displayMessage(result.status, 'Project could not be updated')
  }
}

const removeProject = async () => {
  const confirmed = confirm(
    `Do you realy want to delete the project ${Store.project.name}? This can not be reversed! `
  )
  if (!confirmed) return
  const result = await sendData(`/projects/${Store.project._id}`, 'DELETE')
  if (result.status === true) {
    switchPage(close, `/`)
  } else {
    displayMessage(result.status, 'Could not remove project')
  }
}

const showNewCategory = () => {
  Array.from(
    document
      .getElementById('projectCategories')
      .getElementById('categories')
      .getElementsByClassName('remove')
  ).forEach((element) => {
    element.hidden = true
  })

  const form = document.getElementById('categoryForm')
  const button = document.getElementById('submitCategory')

  if (button.innerText === 'UPDATE') {
    button.innerText = 'ADD'
    document.getElementById('categoryName').value = ''
    document.getElementById('categoryKey').value = ''
    document.getElementById('categoryColor').value = ''
    button.onclick = () => projectFuncs.addCategory()
    if (form.hidden === false) {
      return
    }
  }

  form.hidden = !form.hidden
}

const addCategory = async () => {
  const categoryNameEl = document.getElementById('categoryName')
  const categoryKeyEl = document.getElementById('categoryKey')
  const categoryColorEl = document.getElementById('categoryColor')
  const colorArr = categoryColorEl.value.split(',')

  const result = await sendData(
    `/projects/${Store.project._id}/categories`,
    'POST',
    {
      name: categoryNameEl.value,
      key: categoryKeyEl.value,
      color: colorArr[0],
      colorHex: colorArr[1],
    }
  )
  if (result.status === true) {
    categoryNameEl.value = ''
    categoryKeyEl.value = ''
    categoryColorEl.value = ''
    init()
    displayMessage(result.status, 'Category successfully added')
  } else {
    displayMessage(result.status, 'Could not add category')
  }
}

const showEditCategory = async (categoryId, node) => {
  Array.from(
    document
      .getElementById('projectCategories')
      .getElementsByClassName('remove')
  ).forEach((element) => {
    element.hidden = true
  })

  const form = document.getElementById('categoryForm')
  const button = document.getElementById('submitCategory')

  if (button.innerText.includes('ADD')) {
    const category = Store.project.categories.find(
      (category) => category._id === categoryId
    )

    node.nextSibling.hidden = false
    document.getElementById('categoryName').value = category.name
    document.getElementById('categoryKey').value = category.key
    document.getElementById('categoryColor').value =
      category.color + ',' + category.colorHex
    button.innerText = 'UPDATE'
    button.onclick = () => projectFuncs.updateCategory(categoryId)
    if (form.hidden === false) {
      return
    }
  }

  if (form.hidden === true) node.nextSibling.hidden = false
  form.hidden = !form.hidden
}

const updateCategory = async (categoryId) => {
  const categoryNameEl = document.getElementById('categoryName')
  const categoryKeyEl = document.getElementById('categoryKey')
  const categoryColorEl = document.getElementById('categoryColor')
  const colorArr = categoryColorEl.value.split(',')

  const result = await sendData(
    `/projects/${Store.project._id}/categories/${categoryId}`,
    'PUT',
    {
      name: categoryNameEl.value,
      key: categoryKeyEl.value,
      color: colorArr[0],
      colorHex: colorArr[1],
    }
  )
  if (result.status === true) {
    init()
    categoryNameEl.value = ''
    categoryKeyEl.value = ''
    categoryColorEl.value = ''
    const button = document.getElementById('submitCategory')
    button.innerText = 'Add'
    button.onclick = projectFuncs.addCategory
    displayMessage(result.status, 'Category successfully updated')
  } else {
    displayMessage(result.status, 'Could not update category')
  }
}

const removeCategory = async (categoryId) => {
  const result = await sendData(
    `/projects/${Store.project._id}/categories/${categoryId}`,
    'DELETE'
  )
  if (result.status === true) {
    init()
    displayMessage(result.status, 'Category successfully removed')
  } else {
    displayMessage(result.status, 'Could not remove Category')
  }
}

const showNewClassification = () => {
  Array.from(
    document
      .getElementById('projectClassifications')
      .getElementsByClassName('remove')
  ).forEach((element) => {
    element.hidden = true
  })
  const form = document.getElementById('classificationForm')
  const button = document.getElementById('submitClassification')

  if (button.innerText === 'UPDATE') {
    button.innerText = 'ADD'
    document.getElementById('classificationName').value = ''
    button.onclick = () => projectFuncs.addClassification()
    if (form.hidden === false) {
      return
    }
  }

  form.hidden = !form.hidden
}

const addClassification = async () => {
  const classificationNameEl = document.getElementById('classificationName')

  const result = await sendData(
    `/projects/${Store.project._id}/classifications`,
    'POST',
    {
      name: classificationNameEl.value,
    }
  )
  if (result.status === true) {
    classificationNameEl.value = ''
    init()
    displayMessage(result.status, 'Classification successfully added')
  } else {
    displayMessage(result.status, 'Could not add classification')
  }
}

const showEditClassification = async (classificationId, node) => {
  Array.from(
    document
      .getElementById('projectClassifications')
      .getElementsByClassName('remove')
  ).forEach((element) => {
    element.hidden = true
  })

  const form = document.getElementById('classificationForm')
  const button = document.getElementById('submitClassification')

  if (button.innerText.includes('ADD')) {
    const classification = Store.project.classifications.find(
      (classification) => classification._id === classificationId
    )

    node.nextSibling.hidden = false
    document.getElementById('classificationName').value = classification.name
    button.innerText = 'UPDATE'
    button.onclick = () => projectFuncs.updateClassification(classificationId)
    if (form.hidden === false) {
      return
    }
  }

  if (form.hidden === true) node.nextSibling.hidden = false
  form.hidden = !form.hidden
}

const updateClassification = async (classificationId) => {
  const classificationNameEl = document.getElementById('classificationName')

  const result = await sendData(
    `/projects/${Store.project._id}/classifications/${classificationId}`,
    'PUT',
    {
      name: classificationNameEl.value,
    }
  )
  if (result.status === true) {
    init()
    classificationNameEl.value = ''
    const button = document.getElementById('submitClassification')
    button.innerText = 'Add'
    button.onclick = projectFuncs.addClassification
    displayMessage(result.status, 'Classification successfully updated')
  } else {
    displayMessage(result.status, 'Could not update classification')
  }
}

const removeClassification = async (classificationId) => {
  const result = await sendData(
    `/projects/${Store.project._id}/classifications/${classificationId}`,
    'DELETE'
  )
  if (result.status === true) {
    init()
    displayMessage(result.status, 'Classification successfully removed')
  } else {
    displayMessage(result.status, 'Could not remove classification')
  }
}

const checkTexts = async () => {
  const result = await sendData(`/texts/check`, 'POST', {
    projectId: Store.project._id,
    password: Store.password,
  })

  if (result.status === true) {
    init()
    displayMessage(result.status, 'All texts checked')
  } else {
    displayMessage(result.status, 'Could not check texts')
  }
}

const exportTexts = async () => {
  const folderPath = document.getElementById('exportPath').value
  if (folderPath === '') {
    displayMessage(false, 'Export path can not be empty')
  }
  const result = await sendData(`/texts/export`, 'POST', {
    projectId: Store.project._id,
    folderPath,
    password: Store.password,
  })

  if (result.status === true) {
    displayMessage(result.status, 'Text files successfully exported')
  } else {
    displayMessage(result.status, 'Could not export text files')
  }
}

const showProjectForm = () => {
  document.getElementById('projectNameInput').value = Store.project.name
  document.getElementById('projectDescriptionInput').value =
    Store.project.description
  document.getElementById('projectForm').hidden = !document.getElementById(
    'projectForm'
  ).hidden
}

export {
  init,
  showProjectForm,
  updateProject,
  removeProject,
  addCategory,
  showNewCategory,
  showEditCategory,
  updateCategory,
  removeCategory,
  addClassification,
  showNewClassification,
  showEditClassification,
  updateClassification,
  removeClassification,
  exportTexts,
  checkTexts,
  openText,
}
