const fs = require('fs').promises
const path = require('path')
const { encrypt, decrypt } = require('./crypter')

const readFolder = async (projectId, password, inputPath, subFolder = '') => {
  let stat
  let textCount = 0
  let texts = []

  // Check if path is valid
  try {
    stat = await fs.lstat(inputPath)
  } catch (error) {
    throw { status: 400, message: 'Project path does not exist' }
  }

  try {
    const files = await fs.readdir(path.join(inputPath, subFolder), {
      withFileTypes: true,
    })

    if (files.length === 0) return { textCount, texts }
    for (const file of files) {
      if (file.isDirectory()) {
        const result = await readFolder(
          projectId,
          password,
          inputPath,
          path.join(subFolder, file.name)
        )
        texts = texts.concat(result.texts)
        textCount += result.textCount
        continue
      }
      textCount++
      const content = await fs.readFile(
        path.join(inputPath, subFolder, file.name),
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

const writeFolder = async (
  exportPath,
  projectName,
  texts,
  password,
  classActive,
  projectClassifications
) => {
  try {
    stat = await fs.lstat(exportPath)
  } catch (error) {
    throw { status: 400, message: 'Export path does not exist' }
  }
  const totalPath = path.join(exportPath, `Labelit - ${projectName}`)
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

const readCSV = async (projectId, password, filePath) => {
  const parseCSV = require('csv-parse/lib/sync')
  const texts = []
  let textCount = 0

  try {
    var csvData = await fs.readFile(filePath, 'utf8')
  } catch (error) {
    throw { status: 400, message: 'File path does not exist' }
  }

  const parsed = parseCSV(csvData, {
    columns: false,
    skip_empty_lines: true,
  })
  parsed.shift()

  for (const line of parsed) {
    textCount++
    const id = line[0]
    const content = line[1]
    const contentEnc = encrypt(content, password)
    texts.push({
      name: id,
      contentEncOrg: contentEnc,
      contentEncSaved: contentEnc,
      contentEncHtml: contentEnc,
      project: projectId,
    })
  }

  return { textCount, texts }
}

const writeCSV = async (
  exportPath,
  projectName,
  texts,
  password,
  classActive,
  projectClassifications
) => {
  try {
    stat = await fs.lstat(exportPath)
  } catch (error) {
    throw { status: 400, message: 'Export path does not exist' }
  }

  const totalPath = path.join(exportPath, `Labelit - ${projectName}`)
  await fs.mkdir(totalPath, { recursive: true })

  const header = [
    { id: 'id', title: 'Id' },
    { id: 'text', title: 'Text' },
  ]
  if (classActive)
    header.push({ id: 'classifications', title: 'Classifications' })

  const output = []
  for (const text of texts) {
    if (text.status !== 'confirmed') continue
    const line = {
      id: text.name,
      text: decrypt(text.contentEncSaved, password),
    }
    if (classActive) {
      line.classifications = text.classifications
        .map(
          (classification) =>
            projectClassifications.find(
              (pClassification) =>
                pClassification._id.toString() == classification.toString()
            ).name
        )
        .join(',')
    }
    output.push(line)
  }

  const createCsvWriter = require('csv-writer').createObjectCsvWriter
  const csvWriter = createCsvWriter({
    path: path.join(totalPath, 'export.csv'),
    header: header,
  })

  await csvWriter.writeRecords(output)
}

module.exports = { readFolder, writeFolder, readCSV, writeCSV }
