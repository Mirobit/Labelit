const Project = require('../../models/Project')
const Text = require('../../models/Text')
const fileHandler = require('../../utils/fileHandler')
const { hash } = require('../../utils/crypter')

const get = async name => {
  try {
    const project = await Project.findOne({ name })
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

const create = async data => {
  try {
    // TODO: parallelise?
    const project = await new Project(data)
    const textData = await fileHandler.read(
      data.folderPath,
      project._id,
      data.password
    )
    project.textCount = textData.textCount
    const texts = await Text.insertMany(textData.texts)
    project.texts = texts.map(text => text._id)
    project.password = hash(data.password + process.env.SALT_SCERET)
    await project.save()
    return true
  } catch (error) {
    console.log('service', error)
    throw new Error(error.message)
  }
}

const update = async data => {
  try {
    const project = await Project.findOneAndUpdate({ name: data.name }, data, {
      new: true,
      runValidators: true
    })
    return project
  } catch (error) {
    throw new Error(error.message)
  }
}

const remove = async name => {
  try {
    return await Project.findOneAndDelete({ name })
  } catch (error) {
    throw new Error(error.message)
  }
}

module.exports = { get, list, create, update, remove }
