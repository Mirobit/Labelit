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
    }</span><span class="confirm" onclick="textFuncs.confirmLabel(this)"></span><span class="remove" onclick="textFuncs.removeLabel(this)"></span></span>`
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
      select: 'password categories classifications classActive words name',
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
      projectId: data.project._id,
      contentHtml,
      categories: data.project.categories,
      classActive: data.project.classActive,
      classifications: data.classifications,
      projectClassifications: data.project.classifications,
    }
  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

const getNext = async (textId, projectId, prev = false) => {
  if (prev) {
    nextText = await Text.findOne({
      project: projectId,
      _id: { $lt: textId },
    })
      .sort({ _id: -1 })
      .select('_id')
  } else {
    nextText = await Text.findOne({
      project: projectId,
      _id: { $gt: textId },
    }).select('_id')
  }

  if (nextText === null) {
    const sortBy = prev ? -1 : 1
    nextText = await Text.findOne({ project: projectId })
      .sort({ _id: sortBy })
      .select('_id')
  }

  return nextText._id
}

const list = async (projectId) => {
  try {
    const texts = await Texts.find({ project: projectId })
    return texts
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
  password,
  classifications
) => {
  try {
    const text = await Text.findOneAndUpdate(
      { _id: textId },
      {
        contentEncSaved: encrypt(textRaw, password),
        contentEncHtml: encrypt(htmlText, password),
        status: 'confirmed',
        classifications,
      },
      {
        runValidators: true,
      }
    ).select('status')

    const project = await Project.findById(projectId)
    for (const newWord of newWords) {
      const strEnc = encrypt(newWord.str, password)
      if (project.words.some((word) => word.strEnc === strEnc)) continue
      project.words.push({
        strEnc: strEnc,
        category: newWord.category,
      })
    }
    if (text.status === 'new') {
      project.textUpdatedCount++
      project.progress = Math.round(
        (project.textUpdatedCount / project.textCount) * 100
      )
    }
    await project.save()

    return await getNext(textId, projectId)
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
    'password words categories name'
  )
  if (!(await checkPassword(project.name, password, project.password))) {
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
    if (!(await checkPassword(projectName, password))) return false
    const texts = await Text.find({ project: projectId }).select(
      'name contentEncSaved status'
    )
    fileHandler.write(folderPath, projectName, texts, password)
    return true
  } catch (error) {
    throw new Error(error.message)
  }
}

module.exports = {
  list,
  update,
  remove,
  load,
  getNext,
  exportAll,
  checkAll,
}
