const fs = require('fs').promises
const path = require('path')
const { encrypt, decrypt } = require('./crypter')

const read = async (projectId, password, folderPath, subFolder = '') => {
  let stat
  let textCount = 0
  let texts = []

  // Check if path is valid
  try {
    stat = await fs.lstat(folderPath)
  } catch (error) {
    throw { status: 400, message: 'Project path does not exist' }
  }

  try {
    const files = await fs.readdir(path.join(folderPath, subFolder), {
      withFileTypes: true,
    })

    if (files.length === 0) return { textCount, texts }
    for (const file of files) {
      if (file.isDirectory()) {
        const result = await read(
          projectId,
          password,
          folderPath,
          path.join(subFolder, file.name)
        )
        texts = texts.concat(result.texts)
        textCount += result.textCount
        continue
      }
      textCount++
      const content = await fs.readFile(
        path.join(folderPath, subFolder, file.name),
        'utf8'
      )
      const contentEnc = encrypt(content, password)
      texts.push({
        name: path.join(subFolder, file.name),
        contentEncOrg: contentEnc,
        contentEncSaved: contentEnc,
        contentEncHtml: contentEnc,
        project: projectId,
      })
    }
  } catch (error) {
    throw { status: 400, message: 'Could not read files' }
  }

  return { textCount, texts }
}

const write = async (
  folderPath,
  projectName,
  texts,
  password,
  classActive,
  projectClassifications
) => {
  try {
    stat = await fs.lstat(folderPath)
  } catch (error) {
    throw { status: 400, message: 'Path does not exist' }
  }
  const totalPath = path.join(folderPath, `Labelit - ${projectName}`)
  await fs.mkdir(totalPath, { recursive: true })
  const classContent = {}

  for (const text of texts) {
    if (text.status !== 'confirmed') continue
    if (classActive)
      classContent[text.name] = text.classifications.map(
        (classification) =>
          projectClassifications.find(
            (pClassification) =>
              pClassification._id.toString() == classification.toString()
          ).name
      )
    var divider = process.platform === 'win32' ? '\\' : '/'
    let subFolder = text.name.split(divider)
    const fileName = subFolder.pop()
    subFolder = subFolder.join(divider)
    if (subFolder.length > 0) {
      await fs.mkdir(path.join(totalPath, subFolder), { recursive: true })
    }
    fs.writeFile(
      path.join(totalPath, subFolder, fileName),
      decrypt(text.contentEncSaved, password)
    )
  }

  if (classActive)
    fs.writeFile(
      path.join(totalPath, 'classifications.json'),
      JSON.stringify(classContent, null, 4)
    )
}

module.exports = { read, write }
