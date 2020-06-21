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

const checkWorldlist = (contentArr, words, categories, password, status) => {
  let hits = 0
  if (status === 'confirmed' || categories.length === 0)
    return { contentArr, hits }
  const categoriesMap = new Map()
  categories.forEach((category) => {
    categoriesMap.set(String(category._id), category)
  })

  words.forEach((word) => {
    const str = decrypt(word.strEnc, password)
    const regex = new RegExp('\\b' + str + '\\b', 'i')
    let outerActive = true
    let innerActive = true
    let i = 0
    while (outerActive) {
      if (i > contentArr.length - 1) break
      if (contentArr[i].type === 'label') {
        i++
        continue
      }
      while (innerActive) {
        const index = contentArr[i].text.search(regex)
        if (index === -1) break
        const category = categoriesMap.get(String(word.category))
        hits++
        replaceEntry(
          contentArr,
          i,
          index,
          index + str.length,
          str,
          category,
          'unconfirmed'
        )
      }
      i++
    }
  })

  return { contentArr, hits }
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

  let { contentArr, hits } = checkWorldlist(
    JSON.parse(decrypt(data.contentArr, password)),
    data.project.words,
    data.project.categories,
    password,
    data.status
  )
  return {
    textName: data.name,
    projectId: data.project._id,
    contentArr,
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
  textId,
  projectId,
  contentArr,
  user,
  newWords,
  password,
  classifications
) => {
  const text = await Text.findOneAndUpdate(
    { _id: textId },
    {
      contentArr: encrypt(JSON.stringify(contentArr), password),
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
    'contentArr status name'
  )

  for (const text of texts) {
    const { contentArr, hits } = checkWorldlist(
      JSON.parse(decrypt(text.contentArr, password)),
      project.words,
      project.categories,
      password
    )

    if (hits > 0) {
      totalHits += hits
      const textDb = await Text.findById(text._id)
      textDb.contentArr = encrypt(JSON.stringify(contentArr), password)
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
      select: 'name contentArr status classifications',
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

const replaceEntry = (
  contentArr,
  index,
  start,
  end,
  word,
  category,
  status
) => {
  const text = contentArr[index]
  let firstPart = text.text.slice(0, start)
  let lastPart = text.text.slice(end)

  contentArr.splice(index, 1, {
    text: category.name,
    original: word,
    id: category._id,
    colorHex: category.colorHex,
    status,
  })

  if (end <= text.text.length - 1) {
    'lastparrt',
      contentArr.splice(index + 1, 0, {
        text: lastPart,
        type: 'text',
      })
  }

  if (start > 0) {
    contentArr.splice(index, 0, {
      text: firstPart,
      type: 'text',
    })
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
