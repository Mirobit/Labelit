const Text = require('../../models/Text')
const Project = require('../../models/Project')
const fileHandler = require('../../utils/fileHandler')
const { encrypt, decrypt, hash } = require('../../utils/crypter')

const get = async (textId, password) => {
  try {
    const result = await Text.findById(textId).select('contentEncHtml')
    console.log(textId, result)
    // TODO check against wordlist
    return decrypt(result.contentEncHtml, password)
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
    const content = decrypt(data.contentEncHtml, password)
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

const update = async (
  textRaw,
  htmlText,
  textId,
  projectId,
  user,
  newWords,
  password
) => {
  try {
    console.log(newWords)
    console.log(textRaw)
    console.log(encrypt(textRaw, password))
    console.log('Old text id', textId)
    newWords = newWords.map(newWord => {
      return {
        strEnc: encrypt(newWord.str, password),
        category: newWord.category,
        project: projectId
      }
    })
    await Text.findOneAndUpdate(
      { _id: textId },
      {
        contentEncSaved: encrypt(textRaw, password),
        contentEncHtml: encrypt(htmlText, password),
        done: true
      },
      {
        runValidators: true
      }
    )
    await Project.findOneAndUpdate(
      { _id: projectId },
      {
        $inc: { textUpdatedCount: 1 },
        $push: { words: newWords }
      },
      {
        runValidators: true,
        new: true,
        upsert: true
      }
    )

    const nextTextId = await Text.find({
      _id: { $gt: textId }
    })
      .sort({ _id: 1 })
      .limit(1)
      .select('_id')
    if (nextTextId.length === 0) {
      return 'done'
    }
    return nextTextId[0]._id
  } catch (error) {
    console.log(error)
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
