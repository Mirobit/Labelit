const Text = require('../models/Text')
const Project = require('../models/Project')
const {
  readFolder,
  readCSV,
  readJSON,
  writeFolder,
  writeCSV,
  writeJSON,
} = require('../utils/fileHandler')
const { checkPassword } = require('./projects')
const { encrypt, decrypt, hash } = require('../utils/crypter')

const checkWorldlist = (contentHtml, words, categories, password, status) => {
  let hits = 0
  if (status === 'confirmed' || categories.length === 0)
    return { contentHtml, hits }
  const categoriesMap = new Map()
  categories.forEach((category) => {
    categoriesMap.set(String(category._id), category)
  })
  words.forEach((word) => {
    const str = decrypt(word.strEnc, password)
    const confirmHTML = `<span class="labeledarea"><span class="originalWord">${str}</span><span class="confirmDivider"></span><span class="labeled" title="${str}" style="background-color:${
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
  const data = await Text.findById(textId).populate({
    path: 'project',
    select:
      'password categories classifications classActive showConfirmed words name',
  })
  if (hash(password) !== data.project.password) {
    throw new ValError('Invalid project password')
  }

  let { contentHtml, hits } = checkWorldlist(
    decrypt(data.contentEncHtml, password),
    data.project.words,
    data.project.categories,
    password,
    data.status
  )
  return {
    textName: data.name,
    projectId: data.project._id,
    contentHtml,
    showConfirmed: data.project.showConfirmed,
    categories: data.project.categories,
    classActive: data.project.classActive,
    classifications: data.classifications,
    projectClassifications: data.project.classifications,
  }
}

const getNext = async (textId, projectId, showConfirmed, prev = false) => {
  const confirmedFilter = showConfirmed === 'true' ? 'all' : 'confirmed'
  if (prev) {
    nextText = await Text.findOne({
      project: projectId,
      status: { $ne: confirmedFilter },
      _id: { $lt: textId },
    })
      .sort({ _id: -1 })
      .select('_id')
  } else {
    nextText = await Text.findOne({
      project: projectId,
      status: { $ne: confirmedFilter },
      _id: { $gt: textId },
    }).select('_id')
  }

  if (nextText === null) {
    const sortBy = prev ? -1 : 1
    nextText = await Text.findOne({
      project: projectId,
      status: { $ne: confirmedFilter },
    })
      .sort({ _id: sortBy })
      .select('_id')
  }
  if (nextText) return nextText._id
  return ''
}

const list = async (projectId) => {
  return await Text.find({ project: projectId })
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
  if (text.status !== 'confirmed') {
    project.textUpdatedCount++
    project.progress = Math.round(
      (project.textUpdatedCount / project.textCount) * 100
    )
  }

  await project.save()
}

const remove = async (id) => {
  const result = await Text.findOneAndDelete({ _id: id })
  if (result === null) throw new ValError('Text not found')
}

const checkAll = async (projectId, password) => {
  let totalHits = 0
  let unconfirmedTexts = 0
  const project = await Project.findById(projectId).select(
    'password words categories name textCount textUpdatedCount progress'
  )

  await checkPassword(project.name, password, project.password)

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
      const textDb = await Text.findById(text._id)
      textDb.contentEncHtml = encrypt(contentHtml, password)
      if (textDb.status === 'confirmed') {
        unconfirmedTexts++
        textDb.status = 'unconfirmed'
      }
      await textDb.save()
    }
  }

  if (unconfirmedTexts > 0) {
    project.textUpdatedCount = project.textUpdatedCount - unconfirmedTexts
    project.progress = Math.round(
      (project.textUpdatedCount / project.textCount) * 100
    )
    await project.save()
  }

  return totalHits
}

const exportAll = async (projectId, exportPath, exportMode, password) => {
  const project = await Project.findById(projectId)
    .select('name classActive classifications texts')
    .populate({
      path: 'texts',
      select: 'name contentEncSaved status classifications',
    })
  await checkPassword(project.name, password)
  if (exportMode === 'folder') {
    await writeFolder(
      exportPath,
      project.name,
      project.texts,
      password,
      project.classActive,
      project.classifications
    )
  } else if (exportMode === 'csv') {
    await writeCSV(
      exportPath,
      project.name,
      project.texts,
      password,
      project.classActive,
      project.classifications
    )
  } else if (project.inputMode === 'json') {
    await writeJSON(
      exportPath,
      project.name,
      project.texts,
      password,
      project.classActive,
      project.classifications
    )
  } else {
    throw new ValError('Invalid export mode')
  }
}

const importTexts = async (projectId, importPath, importMode, password) => {
  const project = await Project.findById(projectId)
  const curTexts = await Text.find({ project: projectId }).select('-_id name')
  await checkPassword(project.name, password)

  let loadedTexts
  if (importMode === 'csv') {
    loadedTexts = await readCSV(project._id, password, importPath)
  } else if (importMode === 'folder') {
    loadedTexts = await readFolder(project._id, password, importPath)
  } else if (importMode === 'json') {
    loadedTexts = await readJSON(project._id, password, importPath)
  } else {
    throw new ValError('Invalid import mode')
  }
  if (loadedTexts.length === 0) throw new ValError('No texts found')

  const newTexts = loadedTexts.filter(
    (newText) => !curTexts.some((oldText) => newText.name === oldText.name)
  )
  if (newTexts.length === 0)
    throw new ValError('All found text names/ids already exist in the project')

  const texts = await Text.insertMany(newTexts)
  project.texts = project.texts.concat(texts.map((text) => text._id))

  project.textCount += newTexts.length
  project.progress = Math.round(
    (project.textUpdatedCount / project.textCount) * 100
  )

  try {
    await project.save()
  } catch (error) {
    // clean up
    await Text.deleteMany({ project: project.id })
    throw error
  }
  return {
    new: newTexts.length,
    duplicates: loadedTexts.length - newTexts.length,
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
  importTexts,
}
