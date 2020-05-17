import { sendData, getData } from '../api.js'
import { switchPage, setNavPath } from '../index.js'
import Store from '../store.js'
import { displayMessage } from '../components/message.js'

const init = async () => {
  Store.currentClose = close
  const projectName = window.location.pathname.match(/^\/project\/(.{1,})$/)[1]
  const result = await getData(`/projects/${projectName}`)
  Store.projectPage.hidden = false
  if (result.status !== 200) {
    document.title = `Labelit - Project`
    setNavPath(close, projectName)
    return
  }
  // Main
  Store.project = result.project
  document.title = `Labelit - Project: ${Store.project.name}`
  document.getElementById('exportMode').value = Store.project.inputMode
  document.getElementById('importMode').value = Store.project.inputMode
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
  document.getElementById(
    'textCountHeader'
  ).innerText = `(${Store.project.textCount})`

  // Categories
  const catParent = document.getElementById('projectCategories')
  if (Store.project.categories.length > 0) {
    catParent.innerText = ''
    Store.project.categories.forEach((category) => {
      // Category button
      const catDiv = catParent.appendChild(document.createElement('button'))
      catDiv.classList = `btn btn-${category.color} btn-sm btn-bottom`
      catDiv.onclick = function () {
        showEditCategory(category._id, this)
      }
      catDiv.innerText = category.name
      // Key badge
      const keyBadge = catDiv.appendChild(document.createElement('span'))
      keyBadge.classList = 'badge badge-light badge-left'
      keyBadge.innerText = category.keyUp
      // Remove icon
      const removeDiv = catParent.appendChild(document.createElement('span'))
      removeDiv.classList = 'fa fa-trash-o trash'
      removeDiv.onclick = () => removeCategory(category._id)
      removeDiv.hidden = true
    })
  } else catParent.innerText = 'No categories'

  // Classifications
  if (Store.project.classActive) {
    document.getElementById('classifications').hidden = false
    const classParent = document.getElementById('projectClassifications')
    if (Store.project.classifications.length > 0) {
      classParent.innerText = ''
      Store.project.classifications.forEach((classification) => {
        // Classification button
        const classDiv = classParent.appendChild(
          document.createElement('button')
        )
        classDiv.classList = 'btn btn-secondary btn-sm btn-bottom'
        classDiv.onclick = function () {
          showEditClassification(classification._id, this)
        }
        classDiv.innerText = classification.name
        // Remove image
        const removeDiv = classParent.appendChild(
          document.createElement('span')
        )
        removeDiv.classList = 'fa fa-trash-o trash'
        removeDiv.onclick = () => removeClassification(classification._id)
        removeDiv.hidden = true
      })
    } else classParent.innerText = 'No classifications'
  }
}

const close = () => {
  Store.projectPage.hidden = true
  document.getElementById('classificationForm').hidden = true
  document.getElementById('categoryForm').hidden = true
  document.getElementById('projectForm').hidden = true
  document.getElementById('importForm').hidden = true
  document.getElementById('classificationName').value = ''
  document.getElementById('categoryName').value = ''
  document.getElementById('categoryKey').value = ''
  document.getElementById('categoryColor').value = ''
  document.getElementById('importPath').value = ''
  document.getElementById('exportPath').value = ''
}

const openText = (textId) => {
  switchPage(close, `/project/${encodeURI(Store.project.name)}/text/${textId}`)
}

const showEditProject = () => {
  document.getElementById('projectNameInput').value = Store.project.name
  document.getElementById('projectDescriptionInput').value =
    Store.project.description
  document.getElementById('projectForm').hidden = !document.getElementById(
    'projectForm'
  ).hidden
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
  history.pushState(null, '', `/project/${result.projectName}`)
  init()
  displayMessage(true, 'Project successfully updated')
}

const removeProject = async () => {
  const confirmed = prompt(
    `Do you realy want to delete the project ${Store.project.name}?\nThis can not be reversed!\n\nPlease enter the project password:`
  )
  if (confirmed === null) return
  const result = await sendData(`/projects/${Store.project._id}`, 'DELETE', {
    password: confirmed,
  })

  if (result.status !== 200) {
    return
  }

  switchPage(close, `/`)
}

const showNewCategory = () => {
  Array.from(
    document.getElementById('projectCategories').getElementsByClassName('trash')
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
    document.getElementById('projectCategories').getElementsByClassName('trash')
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
      .getElementsByClassName('trash')
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
      .getElementsByClassName('trash')
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

  displayMessage(true, 'Texts successfully exported')
}

const showImportTexts = () => {
  document.getElementById('importMode').value = Store.project.inputMode
  document.getElementById('importForm').hidden = !document.getElementById(
    'importForm'
  ).hidden
}

const importTexts = async () => {
  const importPath = document.getElementById('importPath').value
  if (importPath === '') {
    displayMessage(false, 'Import path can not be empty')
    return
  }

  const result = await sendData(`/texts/import`, 'POST', {
    projectId: Store.project._id,
    importPath,
    importMode: document.getElementById('importMode').value,
    password: Store.password,
  })

  if (result.status !== 200) {
    return
  }

  init()
  displayMessage(
    true,
    `${result.new} texts successfully imported. ${
      result.duplicates
        ? '\n' + result.duplicates + ' duplicates were ignored!'
        : ''
    }`
  )
}

export {
  init,
  showEditProject,
  updateProject,
  removeProject,
  addCategory,
  showNewCategory,
  updateCategory,
  addClassification,
  showNewClassification,
  updateClassification,
  showImportTexts,
  importTexts,
  exportTexts,
  checkTexts,
  openText,
}
