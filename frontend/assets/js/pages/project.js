import { sendData, getData } from '../api.js'
import { switchPage, setNavPath } from '../index.js'
import Store from '../store.js'
import { displayMessage } from '../components/message.js'

const init = async () => {
  Store.projectPage.hidden = false
  const projectName = window.location.pathname.match(/^\/project\/(.{1,})$/)[1]

  const result = await getData(`/projects/${projectName}`)
  if (result.status !== 200) {
    document.title = `Labelit - Project`
    setNavPath(close, projectName)
    return
  }
  // Main
  Store.project = result.project
  document.title = `Labelit - Project: ${Store.project.name}`
  document.getElementById('exportMode').value = Store.project.inputMode
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
        `<div><span class="link" style="border-bottom: 1px dotted;" onclick="projectFuncs.openText('${text._id}')">${text.name}</span>${status}</div>
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
        `<button type="button" class="btn btn-${category.color} btn-sm" style="margin-bottom: 10px;" onclick="projectFuncs.showEditCategory('${category._id}', this)">${category.name} <span class="badge badge-light">${category.keyUp}</span><span class="sr-only">key</span>
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
  document.getElementById('classificationForm').hidden = true
  document.getElementById('categoryForm').hidden = true
  document.getElementById('projectForm').hiddden = true
  document.getElementById('exportPath').value = ''
}

const openText = (textId) => {
  switchPage(close, `/project/${encodeURI(Store.project.name)}/text/${textId}`)
}

const updateProject = async () => {
  const newProjectName = document.getElementById('projectNameInput').value

  if (newProjectName === '') {
    displayMessage(false, 'Project name required')
    return
  }

  const result = await sendData(`/projects/${Store.project._id}`, 'PUT', {
    name: newProjectName,
    description: document.getElementById('projectDescriptionInput').value,
  })

  if (result.status !== 200) {
    return
  }

  document.getElementById('projectForm').hidden = true
  history.pushState(null, '', `/project/${newProjectName}`)
  init()
  displayMessage(true, 'Project successfully updated')
}

const removeProject = async () => {
  const confirmed = confirm(
    `Do you realy want to delete the project ${Store.project.name}? This can not be reversed! `
  )
  if (!confirmed) return
  const result = await sendData(`/projects/${Store.project._id}`, 'DELETE')

  if (result.status !== 200) {
    return
  }

  switchPage(close, `/`)
}

const showNewCategory = () => {
  Array.from(
    document
      .getElementById('projectCategories')
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
    if (!form.hidden) {
      return
    }
  }

  form.hidden = !form.hidden
}

const addCategory = async () => {
  const categoryNameEl = document.getElementById('categoryName')
  const categoryKeyEl = document.getElementById('categoryKey')
  const categoryColorEl = document.getElementById('categoryColor')

  if (!categoryNameEl.value) {
    displayMessage(false, 'Category name required')
    return
  }
  if (!categoryKeyEl.value) {
    displayMessage(false, 'Category shortcut key required')
    return
  }
  if (!categoryColorEl.value) {
    displayMessage(false, 'Category color required')
    return
  }

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

  if (result.status !== 200) {
    return
  }

  categoryNameEl.value = ''
  categoryKeyEl.value = ''
  categoryColorEl.value = ''
  init()
  displayMessage(true, 'Category successfully added')
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

  const category = Store.project.categories.find(
    (category) => category._id === categoryId
  )

  if (document.getElementById('categoryName').value === category.name) {
    form.hidden = !form.hidden
    node.nextSibling.hidden = form.hidden
    return
  }

  node.nextSibling.hidden = false
  document.getElementById('categoryName').value = category.name
  document.getElementById('categoryKey').value = category.key
  document.getElementById('categoryColor').value =
    category.color + ',' + category.colorHex
  button.innerText = 'UPDATE'
  button.onclick = () => projectFuncs.updateCategory(categoryId)
  if (!form.hidden) {
    return
  }

  if (form.hidden) node.nextSibling.hidden = false
  form.hidden = !form.hidden
}

const updateCategory = async (categoryId) => {
  const categoryNameEl = document.getElementById('categoryName')
  const categoryKeyEl = document.getElementById('categoryKey')
  const categoryColorEl = document.getElementById('categoryColor')

  if (!categoryNameEl.value) {
    displayMessage(false, 'Category name required')
    return
  }
  if (!categoryKeyEl.value) {
    displayMessage(false, 'Category shortcut key required')
    return
  }

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

  if (result.status !== 200) {
    return
  }

  init()
  categoryNameEl.value = ''
  categoryKeyEl.value = ''
  categoryColorEl.value = ''
  const button = document.getElementById('submitCategory')
  button.innerText = 'Add'
  button.onclick = projectFuncs.addCategory
  displayMessage(true, 'Category successfully updated')
}

const removeCategory = async (categoryId) => {
  const result = await sendData(
    `/projects/${Store.project._id}/categories/${categoryId}`,
    'DELETE'
  )

  if (result.status !== 200) {
    return
  }

  document.getElementById('categoryForm').hidden = true
  init()
  displayMessage(true, 'Category successfully removed')
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
    if (!form.hidden) {
      return
    }
  }

  form.hidden = !form.hidden
}

const addClassification = async () => {
  const classificationNameEl = document.getElementById('classificationName')

  if (!classificationNameEl.value) {
    displayMessage(false, 'Classification name required')
    return
  }

  const result = await sendData(
    `/projects/${Store.project._id}/classifications`,
    'POST',
    {
      name: classificationNameEl.value,
    }
  )

  if (result.status !== 200) {
    return
  }

  classificationNameEl.value = ''
  init()
  displayMessage(true, 'Classification successfully added')
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

  const classification = Store.project.classifications.find(
    (classification) => classification._id === classificationId
  )

  if (
    document.getElementById('classificationName').value === classification.name
  ) {
    form.hidden = !form.hidden
    node.nextSibling.hidden = form.hidden
    return
  }

  node.nextSibling.hidden = false
  document.getElementById('classificationName').value = classification.name
  button.innerText = 'UPDATE'
  button.onclick = () => projectFuncs.updateClassification(classificationId)
  if (!form.hidden) {
    return
  }

  if (form.hidden) node.nextSibling.hidden = false
  form.hidden = !form.hidden
}

const updateClassification = async (classificationId) => {
  const classificationNameEl = document.getElementById('classificationName')

  if (!classificationNameEl.value) {
    displayMessage(false, 'Classification name required')
    return
  }

  const result = await sendData(
    `/projects/${Store.project._id}/classifications/${classificationId}`,
    'PUT',
    {
      name: classificationNameEl.value,
    }
  )

  if (result.status !== 200) {
    return
  }

  init()
  classificationNameEl.value = ''
  const button = document.getElementById('submitClassification')
  button.innerText = 'Add'
  button.onclick = projectFuncs.addClassification
  displayMessage(true, 'Classification successfully updated')
}

const removeClassification = async (classificationId) => {
  const result = await sendData(
    `/projects/${Store.project._id}/classifications/${classificationId}`,
    'DELETE'
  )

  if (result.status !== 200) {
    return
  }

  document.getElementById('classificationForm').hidden = true
  init()
  displayMessage(true, 'Classification successfully removed')
}

const checkTexts = async () => {
  const result = await sendData(`/texts/check`, 'POST', {
    projectId: Store.project._id,
    password: Store.password,
  })

  if (result.status !== 200) {
    return
  }

  init()
  displayMessage(true, 'All texts checked')
}

const exportTexts = async () => {
  const exportPath = document.getElementById('exportPath').value
  if (exportPath === '') {
    displayMessage(false, 'Export path can not be empty')
    return
  }

  const result = await sendData(`/texts/export`, 'POST', {
    projectId: Store.project._id,
    exportPath,
    exportMode: document.getElementById('exportMode').value,
    password: Store.password,
  })

  if (result.status !== 200) {
    return
  }

  displayMessage(true, 'Text files successfully exported')
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
