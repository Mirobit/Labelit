const Text = require('../../models/Text')
const Project = require('../../models/Project')
const fileHandler = require('../../utils/fileHandler')
const { hash } = require('../../utils/crypter')

const get = async name => {
  try {
    const project = await Project.findOne({ name }).populate({
      path: 'texts',
      select: 'name done'
    })
    return project
  } catch (error) {
    console.log(error)
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

const checkPassword = async (projectId, password) => {
  const project = await Project.findById(projectId).select('password')

  const passwordHashed = hash(password + process.env.SALT_SCERET)
  console.log(passwordHashed, project.password)
  return passwordHashed === project.password
}

const remove = async name => {
  try {
    return await Project.findOneAndDelete({ name })
  } catch (error) {
    throw new Error(error.message)
  }
}

const addCategory = async (projectId, data) => {
  console.log(data)
  try {
    const project = await Project.findOneAndUpdate(
      { _id: projectId },
      { $push: { categories: data } },
      { new: true, runValidators: true }
    )
    return project
  } catch (error) {
    throw new Error(error.message)
  }
}

const updateCategory = async (projectId, categoryId, data) => {
  console.log('service update')
  try {
    const project = await Project.findOneAndUpdate(
      { _id: projectId, 'categories._id': categoryId },
      {
        $set: {
          'categories.$.name': data.name,
          'categories.$.key': data.key,
          'categories.$.keyCode': data.keyCode,
          'categories.$.color': data.color
        }
      },
      { runValidators: true, new: true }
    )
    return project
  } catch (error) {
    throw new Error(error.message)
  }
}

const removeCategory = async (projectId, categoryId) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: projectId },
      { $pull: { categories: { _id: categoryId } } }
    )
    return project
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
  addCategory,
  updateCategory,
  removeCategory,
  checkPassword
}
