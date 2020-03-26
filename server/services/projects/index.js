const Project = require('../../models/Project')
const fs = require('fs')

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
    const projects = await Project.find({}) // .select({ "name": 1, "_id": 0})
    return projects
  } catch (error) {
    throw new Error(error.message)
  }
}

const create = async data => {
  try {
    await new Project(data).save()
    return true
  } catch (error) {
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
