const Text = require('../../models/Text')
const fileHandler = require('../../utils/fileHandler')
const { decrypt, hash } = require('../../utils/crypter')

const get = async id => {
  try {
    const text = await Text.findById(id).populate({
      path: 'project',
      select: 'name password category done'
    })
    return text
  } catch (error) {
    throw new Error(error.message)
  }
}

const init = async (textId, password) => {
  try {
    const data = await Text.findById(textId).populate({
      path: 'project',
      select: 'name password categories words done'
    })
    if (hash(password) !== data.project.password) {
      throw new Error('Invalid project password')
    }
    const content = decrypt(data.contentEnc, password)
    return {
      name: data.name,
      content,
      projectName: data.project.name,
      categories: data.project.categories,
      words: data.project.words
    }
  } catch (error) {
    throw new Error(error.message)
  }
}

const list = async projectId => {
  try {
    const texts = await Texts.find({ project: projectId }) // .select({ "name": 1, "_id": 0})
    return texts
  } catch (error) {
    throw new Error(error.message)
  }
}

const create = async data => {
  try {
    const text = fileHandler.read(data.path)
    await new Text(data).save()
    return true
  } catch (error) {
    throw new Error(error.message)
  }
}

const update = async data => {
  try {
    await Text.findOneAndUpdate({ _id: data.id }, data, {
      runValidators: true
    })
    return true
  } catch (error) {
    throw new Error(error.message)
  }
}

const remove = async id => {
  try {
    return await Text.findOneAndDelete({ _id: id })
  } catch (error) {
    throw new Error(error.message)
  }
}

module.exports = { get, list, create, update, remove, init }
