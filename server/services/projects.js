const Text = require('../models/Text')
const Project = require('../models/Project')
const { readFolder, readCSV, readJSON } = require('../utils/fileHandler')
const { hash } = require('../utils/crypter')

const get = async (name) => {
  const project = await Project.findOne({ name }).populate({
    path: 'texts',
    select: 'name status',
  })
  return project
}

const list = async () => {
  const projects = await Project.find({}, null, { sort: { created_at: -1 } }) // .select({ "name": 1, "_id": 0})
  return projects
}

const create = async (data) => {
  const project = await new Project(data)
  let textData
  if (data.inputMode === 'csv') {
    textData = await readCSV(project._id, data.password, data.inputPath)
  } else if (data.inputMode === 'folder') {
    textData = await readFolder(project._id, data.password, data.inputPath)
  } else if (data.inputMode === 'json') {
    textData = await readJSON(project._id, data.password, data.inputPath)
  } else {
    throw new ValError('Invalid input mode')
  }

  project.textCount = textData.textCount
  const texts = await Text.insertMany(textData.texts)
  project.texts = texts.map((text) => text._id)
  project.password = hash(data.password)

  try {
    await project.save()
  } catch (error) {
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
}

const remove = async (id) => {
  await Project.findOneAndDelete({ _id: id })
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

  project.categories.push(newCategory)

  await project.save()
}

const updateCategory = async (projectId, categoryId, categoryData) => {
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

  project.categories[catIndex] = { ...categoryData, _id: categoryId }

  await project.save()
}

const removeCategory = async (projectId, categoryId) => {
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
    throw new ValError('Duplicate classificiation')
  }
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
