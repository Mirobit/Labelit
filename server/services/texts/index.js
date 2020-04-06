const Text = require('../../models/Text')
const Project = require('../../models/Project')
const fileHandler = require('../../utils/fileHandler')
const { encrypt, decrypt, hash } = require('../../utils/crypter')

const get = async (textId, password) => {
  try {
    const result = await Text.findById(textId)
      .populate({
        path: 'project',
        select: 'words categories'
      })
      .select('contentEncHtml words categories')
    let contentHtml = decrypt(result.contentEncHtml, password)
    contentHtml = checkWorldlist(
      contentHtml,
      result.project.words,
      result.project.categories,
      password
    )
    // TODO check against wordlist
    return contentHtml
  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

const checkWorldlist = async (contentHtml, words, categories, password) => {
  const categoriesMap = new Map()
  categories.forEach(category => {
    categoriesMap.set(String(category._id), category)
    console.log('mapping')
  })
  let testC = contentHtml
  words.forEach(word => {
    const str = decrypt(word.strEnc, password)
    console.log(str, word)
    const confirmHTML = ` <span class="labeledarea"><span class="originalWord">${str}</span><span class="confirmDivider"></span><span class="labeled" style="background-color:${
      categoriesMap.get(String(word.category)).colorHex
    }">${
      categoriesMap.get(String(word.category)).name
    }</span><span class="confirm" onclick="window.editor.confirmLabel(this)"></span><span class="remove" onclick="window.editor.removeLabel(this)"></span></span>`
    testC = testC.replace(
      new RegExp('((?!>).)\\b' + str + '\\b', 'g'),
      confirmHTML
    )
  })
  console.log(testC)

  return testC
}

const init = async (textId, password) => {
  try {
    const data = await Text.findById(textId).populate({
      path: 'project',
      select: 'name password categories words'
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
        status: 'confirmed'
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

    let nextText = await Text.findOne({ _id: { $gt: textId } }).select(
      '_id name'
    )
    if (nextText === null) {
      nextText = await Text.findOne()
        .sort({ _id: 1 })
        .select('_id name')
    }
    return { nextTextId: nextText._id, nextTextName: nextText.name }
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
