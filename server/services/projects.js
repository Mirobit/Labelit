const Text = require('../models/Text')
const Project = require('../models/Project')
const { readFolder, readCSV, readJSON } = require('../utils/fileHandler')
const { hash, encrypt, decrypt } = require('../utils/crypter')

const get = async (name) => {
  const project = await Project.findOne({ name })
    .populate({
      path: 'texts',
      select: 'name status',
    })
    .lean()
  return project
}

const list = async () => {
  const projects = await Project.find({}, null, { sort: { created_at: -1 } }) // .select({ "name": 1, "_id": 0})
  return projects
}

const create = async (data) => {
  data.name = data.name.replace(/<.*?>/gm, '-')
  data.description = data.description.replace(/<.*?>/gm, '-')

  const project = await new Project(data)
  let loadedTexts
  if (data.inputMode === 'csv') {
    loadedTexts = await readCSV(project._id, data.password, data.inputPath)
  } else if (data.inputMode === 'folder') {
    loadedTexts = await readFolder(project._id, data.password, data.inputPath)
  } else if (data.inputMode === 'json') {
    loadedTexts = await readJSON(project._id, data.password, data.inputPath)
  } else {
    throw new ValError('Invalid input mode')
  }

  project.textCount = loadedTexts.length
  const texts = await Text.insertMany(loadedTexts)
  project.texts = texts.map((text) => text._id)
  project.password = hash(data.password)
  project.version = PROJECT_VERSION

  try {
    await project.save()
  } catch (error) {
    // Cleanup texts for non existing project
    await Text.deleteMany({ project: project.id })
    if (error.code === 11000) {
      throw new ValError('Project name already exists')
    } else {
      throw error
    }
  }
}

const update = async (id, data) => {
  for (let prop in data) {
    if (data[prop] === undefined) delete data[prop]
    else data[prop] = data[prop].replace(/<.*?>/gm, '-')
  }

  try {
    await Project.findOneAndUpdate({ _id: id }, data, {
      new: true,
      runValidators: true,
    })
  } catch (error) {
    if (error.code === 11000) {
      throw new ValError('Project name already exists')
    } else {
      throw error
    }
  }

  return data.name
}

const remove = async (id, password) => {
  const result = await Project.findOneAndDelete({
    _id: id,
    password: hash(password),
  })
  if (result === null)
    throw new ValError('Can not remove project. Invalid project password')

  await Text.deleteMany({ project: id })
}

const checkPassword = async (projectName, password, projectPassword) => {
  if (projectPassword === undefined) {
    projectPassword = (
      await Project.findOne({ name: projectName }).select('+password')
    ).password
  }
  if (hash(password) === projectPassword) return true
  else throw new ValError('Invalid project password')
}

const addCategory = async (projectId, newCategory) => {
  const project = await Project.findById(projectId)
  if (
    project.categories.some(
      (category) =>
        category.name.toUpperCase() === newCategory.name.toUpperCase()
    )
  )
    throw new ValError('Duplicate category name')

  if (project.categories.some((category) => category.key === newCategory.key))
    throw new ValError('Duplicate category shortcut key')

  for (const prop in newCategory) {
    newCategory[prop] = newCategory[prop].replace(/<.*?>/gm, '')
  }
  project.categories.push(newCategory)

  await project.save()
}

const updateCategory = async (
  projectId,
  categoryId,
  categoryData,
  password
) => {
  const project = await Project.findById(projectId)

  const catIndex = project.categories.findIndex(
    (category) => category._id == categoryId
  )

  if (
    project.categories.some(
      (category, index) =>
        index !== catIndex &&
        category.name.toUpperCase() === categoryData.name.toUpperCase()
    )
  )
    throw new ValError('Duplicate category name')

  if (
    project.categories.some(
      (category, index) =>
        index !== catIndex && category.key === categoryData.key
    )
  )
    throw new ValError('Duplicate category shortcut key')

  for (const prop in categoryData) {
    categoryData[prop] = categoryData[prop].replace(/<.*?>/gm, '')
  }
  project.categories[catIndex] = { ...categoryData, _id: categoryId }
  await project.save()

  const texts = await Text.find({ project: projectId })
  for (let text of texts) {
    let hits = 0
    contentArrDe = JSON.parse(decrypt(text.contentArr, password))
    for (let i = 0; i < contentArrDe.length; i++) {
      if (contentArrDe[i].type === 'text') continue
      if (contentArrDe[i].id != categoryId) continue
      hits++
      contentArrDe[i].text = categoryData.name
      contentArrDe[i].colorHex = categoryData.colorHex
    }
    if (hits > 0) {
      text.contentArr = encrypt(JSON.stringify(contentArrDe), password)
      await text.save()
    }
  }
}

const removeCategory = async (projectId, categoryId, password) => {
  const texts = await Text.find({ project: projectId })
  for (let text of texts) {
    let hits = 0
    contentArrDe = JSON.parse(decrypt(text.contentArr, password))
    for (let i = 0; i < contentArrDe.length; i++) {
      const entry = contentArrDe[i]
      if (entry.type === 'text') continue
      if (entry.id != categoryId) continue

      hits++
      const original = contentArrDe[i].original
      let textBefore = ''
      let textAfter = ''
      let newIndexStart = i
      let steps = 1

      if (i > 0 && contentArrDe[i - 1].type === 'text') {
        textBefore = contentArrDe[i - 1].text
        newIndexStart--
        steps++
      }
      if (i < contentArrDe.length - 1 && contentArrDe[i + 1].type === 'text') {
        textAfter = contentArrDe[i + 1].text
        steps++
      }

      const newText = textBefore + original + textAfter

      contentArrDe.splice(newIndexStart, steps, {
        text: newText,
        type: 'text',
      })
    }
    if (hits > 0) {
      text.contentArr = encrypt(JSON.stringify(contentArrDe), password)
      await text.save()
    }
  }

  await Project.findOneAndUpdate(
    { _id: projectId },
    { $pull: { categories: { _id: categoryId } } }
  )
}

const addClassification = async (projectId, newClassification) => {
  const project = await Project.findById(projectId)
  if (
    project.classifications.some(
      (classification) =>
        classification.name.toUpperCase() ===
        newClassification.name.toUpperCase()
    )
  ) {
    throw new ValError('Duplicate classification')
  }

  newClassification.name = newClassification.name.replace(/<.*?>/gm, '')
  project.classifications.push(newClassification)

  await project.save()
}

const updateClassification = async (
  projectId,
  classificationId,
  classificationData
) => {
  const project = await Project.findById(projectId)

  const classIndex = project.classifications.findIndex(
    (classification) => classification._id == classificationId
  )

  if (
    project.classifications.some((classification, index) => {
      return (
        index !== classIndex &&
        classification.name.toUpperCase() ===
          classificationData.name.toUpperCase()
      )
    })
  )
    throw new ValError('Duplicate classification')

  classificationData.name = classificationData.name.replace(/<.*?>/gm, '')
  project.classifications[classIndex] = {
    ...classificationData,
    _id: classificationId,
  }

  await project.save()
}

const removeClassification = async (projectId, classificationId) => {
  await Project.findOneAndUpdate(
    { _id: projectId },
    { $pull: { classifications: { _id: classificationId } } }
  )
}

module.exports = {
  get,
  list,
  create,
  update,
  remove,
  checkPassword,
  addCategory,
  updateCategory,
  removeCategory,
  addClassification,
  updateClassification,
  removeClassification,
}
