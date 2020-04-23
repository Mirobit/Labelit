const Text = require('../../models/Text')
const Project = require('../../models/Project')
const fileHandler = require('../../utils/fileHandler')
const { hash } = require('../../utils/crypter')

const get = async (name) => {
  try {
    const project = await Project.findOne({ name }).populate({
      path: 'texts',
      select: 'name status',
    })
    return project
  } catch (error) {
    throw new Error(error.message)
  }
}

const list = async () => {
  try {
    const projects = await Project.find({}, null, { sort: { created_at: -1 } }) // .select({ "name": 1, "_id": 0})
    return projects
  } catch (error) {
    throw new Error(error.message)
  }
}

const create = async (data) => {
  try {
    console.log(data)
    const project = await new Project(data)
    const textData = await fileHandler.read(
      data.folderPath,
      project._id,
      data.password
    )
    project.textCount = textData.textCount
    const texts = await Text.insertMany(textData.texts)
    project.texts = texts.map((text) => text._id)
    project.password = hash(data.password)
    await project.save()
    return true
  } catch (error) {
    throw new Error(error.message)
  }
}

const update = async (id, data) => {
  try {
    await Project.findOneAndUpdate({ _id: id }, data, {
      new: true,
      runValidators: true,
    })
    return
  } catch (error) {
    throw new Error(error.message)
  }
}

const remove = async (id) => {
  try {
    await Project.findOneAndDelete({ _id: id })
    await Text.deleteMany({ project: id })
    return
  } catch (error) {
    throw new Error(error.message)
  }
}

const checkPassword = async (projectName, password, projectPassword) => {
  if (projectPassword === undefined) {
    projectPassword = (
      await Project.findOne({ name: projectName }).select('+password')
    ).password
  }
  return hash(password) === projectPassword
}

const addCategory = async (projectId, newCategory) => {
  try {
    await Project.findById(projectId)
    if (
      project.categories.some(
        (category) =>
          category.name.toUpperCase() === newCategory.name.toUpperCase() ||
          category.key === newCategory.key ||
          category.color === newCategory.color
      )
    ) {
      throw new Error('Duplicate category')
    }
    project.categories.push(newCategory)
    project.save()

    return
  } catch (error) {
    throw new Error(error)
  }
}

const updateCategory = async (projectId, categoryId, categoryData) => {
  try {
    await Project.findById(projectId)

    const catIndex = project.categories.findIndex(
      (category) => category._id == categoryId
    )
    const dupIndex = project.categories.findIndex(
      (category) =>
        category._id != categoryId &&
        (category.name.toUpperCase() === categoryData.name.toUpperCase() ||
          category.key === categoryData.key ||
          category.color === categoryData.color)
    )

    if (dupIndex !== -1) throw new Error('Duplicate category')

    project.categories[catIndex] = { ...categoryData, _id: categoryId }
    await project.save()

    return
  } catch (error) {
    throw new Error(error.message)
  }
}

const removeCategory = async (projectId, categoryId) => {
  try {
    await Project.findOneAndUpdate(
      { _id: projectId },
      { $pull: { categories: { _id: categoryId } } }
    )

    return
  } catch (error) {
    throw new Error(error.message)
  }
}

const addClassification = async (projectId, newClassification) => {
  try {
    const project = await Project.findById(projectId)
    if (
      project.classifications.some(
        (classification) =>
          classification.name.toUpperCase() ===
          newClassification.name.toUpperCase()
      )
    ) {
      throw new Error('Duplicate category')
    }
    project.classifications.push(newClassification)
    await project.save()

    return
  } catch (error) {
    throw new Error(error)
  }
}

const updateClassification = async (
  projectId,
  classificationId,
  classificationData
) => {
  try {
    const project = await Project.findById(projectId)

    const classIndex = project.classifications.findIndex(
      (classification) => classification._id == classificationId
    )
    const dupIndex = project.classifications.findIndex(
      (classification, index) => {
        console.log(
          index,
          classIndex,
          classification.name,
          classificationData.name
        )
        return (
          index != classIndex &&
          classification.name.toUpperCase() ===
            classificationData.name.toUpperCase()
        )
      }
    )

    if (dupIndex !== -1) throw new Error('Duplicate classification')

    project.classifications[classIndex] = {
      ...classificationData,
      _id: classificationId,
    }
    await project.save()

    return
  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

const removeClassification = async (projectId, classificationId) => {
  try {
    await Project.findOneAndUpdate(
      { _id: projectId },
      { $pull: { classifications: { _id: classificationId } } }
    )

    return
  } catch (error) {
    throw new Error(error.message)
  }
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
