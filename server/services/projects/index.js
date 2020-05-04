const Text = require('../../models/Text')
const Project = require('../../models/Project')
const fileHandler = require('../../utils/fileHandler')
const { hash } = require('../../utils/crypter')

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
  const textData = await fileHandler.read(
    project._id,
    data.password,
    data.folderPath
  )
  project.textCount = textData.textCount
  const texts = await Text.insertMany(textData.texts)
  project.texts = texts.map((text) => text._id)
  project.password = hash(data.password)

  await project.save()
}

const update = async (id, data) => {
  for (let prop in data) {
    if (data[prop] === undefined) delete data[prop]
  }

  await Project.findOneAndUpdate({ _id: id }, data, {
    new: true,
    runValidators: true,
  })
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
  else throw { name: 'Custom', message: 'Invalid project password' }
}

const addCategory = async (projectId, newCategory) => {
  const project = await Project.findById(projectId)
  if (
    project.categories.some(
      (category) =>
        category.name.toUpperCase() === newCategory.name.toUpperCase() ||
        category.key === newCategory.key ||
        category.color === newCategory.color
    )
  ) {
    throw { name: 'Custom', message: 'Duplicate category' }
  }
  project.categories.push(newCategory)

  await project.save()
}

const updateCategory = async (projectId, categoryId, categoryData) => {
  const project = await Project.findById(projectId)

  const catIndex = project.categories.findIndex(
    (category) => category._id == categoryId
  )
  const dupIndex = project.categories.findIndex(
    (category, index) =>
      index !== catIndex &&
      (category.name.toUpperCase() === categoryData.name.toUpperCase() ||
        category.key === categoryData.key ||
        category.color === categoryData.color)
  )

  if (dupIndex !== -1) throw { name: 'Custom', message: 'Duplicate category' }

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
    throw { name: 'Custom', message: 'Duplicate classification' }
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
  const dupIndex = project.classifications.findIndex(
    (classification, index) => {
      return (
        index !== classIndex &&
        classification.name.toUpperCase() ===
          classificationData.name.toUpperCase()
      )
    }
  )

  if (dupIndex !== -1)
    throw { name: 'Custom', message: 'Duplicate classification' }

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
