const Text = require('../../models/Text')
const Project = require('../../models/Project')
const fileHandler = require('../../utils/fileHandler')
const { checkPassword } = require('../projects')
const { encrypt, decrypt, hash } = require('../../utils/crypter')

const checkWorldlist = (contentHtml, words, categories, password) => {
  let hits = 0
  const categoriesMap = new Map()
  categories.forEach((category) => {
    categoriesMap.set(String(category._id), category)
  })
  words.forEach((word) => {
    const str = decrypt(word.strEnc, password)
    const confirmHTML = `<span class="labeledarea"><span class="originalWord">${str}</span><span class="confirmDivider"></span><span class="labeled" style="background-color:${
      categoriesMap.get(String(word.category)).colorHex
    }">${
      categoriesMap.get(String(word.category)).name
    }</span><span class="confirm" onclick="window.editor.confirmLabel(this)"></span><span class="remove" onclick="window.editor.removeLabel(this)"></span></span>`
    contentHtml = contentHtml.replace(
      new RegExp('(?![^<]*>)\\b' + str + '\\b((?!<\\/span))', 'g'),
      () => {
        hits++
        return confirmHTML
      }
    )
  })

  return { contentHtml, hits }
}

const load = async (textId, password) => {
  try {
    const data = await Text.findById(textId).populate({
      path: 'project',
      select: 'password categories words',
    })
    if (hash(password) !== data.project.password) {
      throw new Error('Invalid project password')
    }

    let { contentHtml, hits } = checkWorldlist(
      decrypt(data.contentEncHtml, password),
      data.project.words,
      data.project.categories,
      password
    )
    return {
      textName: data.name,
      contentHtml,
      categories: data.project.categories,
    }
  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

const list = async (projectId) => {
  try {
    const texts = await Texts.find({ project: projectId })
    return texts
  } catch (error) {
    throw new Error(error.message)
  }
}

const create = async (data) => {
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
    newWords = newWords.map((newWord) => {
      return {
        strEnc: encrypt(newWord.str, password),
        category: newWord.category,
      }
    })
    await Text.findOneAndUpdate(
      { _id: textId },
      {
        contentEncSaved: encrypt(textRaw, password),
        contentEncHtml: encrypt(htmlText, password),
        status: 'confirmed',
      },
      {
        runValidators: true,
      }
    )
    await Project.findOneAndUpdate(
      { _id: projectId },
      {
        $inc: { textUpdatedCount: 1 },
        $push: { words: newWords },
      },
      {
        runValidators: true,
        new: true,
        upsert: true,
      }
    )

    let nextText = await Text.findOne({ _id: { $gt: textId } }).select(
      '_id name'
    )
    if (nextText === null) {
      nextText = await Text.findOne().sort({ _id: 1 }).select('_id name')
    }
    return { nextTextId: nextText._id, nextTextName: nextText.name }
  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

const remove = async (id) => {
  try {
    return await Text.findOneAndDelete({ _id: id })
  } catch (error) {
    throw new Error(error.message)
  }
}

const checkAll = async (projectId, password) => {
  let totalHits = 0
  const project = await Project.findById(projectId).select(
    'password words categories'
  )
  if (!(await checkPassword(projectId, password, project.password))) {
    throw new Error('Invalid password')
  }
  const texts = await Text.find({ project: projectId }).select(
    'contentEncHtml status name'
  )

  for (const text of texts) {
    const { contentHtml, hits } = checkWorldlist(
      decrypt(text.contentEncHtml, password),
      project.words,
      project.categories,
      password
    )

    if (hits > 0) {
      totalHits += hits
      Text.findOneAndUpdate(
        { _id: text._id },
        {
          contentEncHtml: encrypt(contentHtml, password),
          status: 'unconfirmed',
        },
        {
          runValidators: true,
          new: true,
        }
      ).exec()
    }
  }
  return totalHits
}

const exportAll = async (projectId, projectName, folderPath, password) => {
  try {
    if (!(await checkPassword(projectId, password))) return false
    const texts = await Text.find({ project: projectId }).select(
      'name contentEncSaved status'
    )
    fileHandler.write(folderPath, projectName, texts, password)
    return true
  } catch (error) {
    throw new Error(error.message)
  }
}

module.exports = { list, create, update, remove, load, exportAll, checkAll }
