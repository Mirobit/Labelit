const fs = require('fs').promises
const path = require('path')
const { encrypt, decrypt } = require('./crypter')

const readFolder = async (projectId, password, inputPath, subFolder = '') => {
  let stat
  let texts = []

  // Check if path is valid
  try {
    stat = await fs.lstat(inputPath)
  } catch (error) {
    throw new ValError('Project path does not exist')
  }

  try {
    const files = await fs.readdir(path.join(inputPath, subFolder), {
      withFileTypes: true,
    })

    if (files.length === 0) return texts
    for (const file of files) {
      if (file.isDirectory()) {
        const result = await readFolder(
          projectId,
          password,
          inputPath,
          path.join(subFolder, file.name)
        )
        texts = texts.concat(result)
        continue
      }

      const content = await fs.readFile(
        path.join(inputPath, subFolder, file.name),
        'utf8'
      )
      const contentEnc = encrypt(content, password)
      texts.push({
        name: path.join(subFolder, file.name),
        contentOrg: contentEnc,
        contentArr: encrypt(
          JSON.stringify([{ text: content, type: 'text' }]),
          password
        ),
        project: projectId,
        version: TEXT_VERSION,
      })
    }
  } catch (error) {
    throw new ValError('Files could not be read')
  }

  return texts
}

const getTextFromArr = (contentArr, password) => {
  contentArr = JSON.parse(decrypt(contentArr, password))
  let str = ''
  for (const entry of contentArr) {
    str += entry.text
  }
  return str
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
    throw new ValError('Export path does not exist')
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
    let subFolder = text.name.split(/\/|\\/)
    const fileName = subFolder.pop()
    subFolder = subFolder.join('/')
    if (subFolder.length > 0) {
      await fs.mkdir(path.join(totalPath, subFolder), { recursive: true })
    }
    await fs.writeFile(
      path.join(totalPath, subFolder, fileName),
      getTextFromArr(text.contentArr, password)
    )
  }

  if (classActive)
    await fs.writeFile(
      path.join(totalPath, 'classifications.json'),
      JSON.stringify(classContent, null, 4)
    )
}

const readJSON = async (projectId, password, filePath) => {
  const texts = []

  try {
    var jsonData = await fs.readFile(filePath, 'utf8')
  } catch (error) {
    throw new ValError('File path does not exist')
  }

  const parsed = JSON.parse(jsonData)

  for (const entry of parsed) {
    const contentEnc = encrypt(entry.text, password)
    texts.push({
      name: entry.id.replace(/</g, '&lt'),
      contentOrg: contentEnc,
      contentArr: encrypt(
        JSON.stringify([{ text: entry.text, type: 'text' }]),
        password
      ),
      project: projectId,
      version: TEXT_VERSION,
    })
  }

  return texts
}

const writeJSON = async (
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
    throw new ValError('Export path does not exist')
  }

  const totalPath = path.join(exportPath, `Labelit - ${projectName}`)
  await fs.mkdir(totalPath, { recursive: true })

  const output = []
  for (const text of texts) {
    if (text.status !== 'confirmed') continue
    const entry = {
      id: text.name,
      text: getTextFromArr(text.contentArr, password),
    }
    if (classActive) {
      entry.classifications = text.classifications
        .map(
          (classification) =>
            projectClassifications.find(
              (pClassification) =>
                pClassification._id.toString() == classification.toString()
            ).name
        )
        .join(',')
    }
    output.push(entry)
  }

  await fs.writeFile(
    path.join(totalPath, 'export.json'),
    JSON.stringify(output, null, 4)
  )
}

const readCSV = async (projectId, password, filePath) => {
  const parseCSV = require('csv-parse/lib/sync')
  const texts = []

  try {
    var csvData = await fs.readFile(filePath, 'utf8')
  } catch (error) {
    throw new ValError('File path does not exist')
  }

  let delimiter = ','
  const firstLine = csvData.split('\n')[0]
  if (firstLine.includes(';')) {
    if (firstLine.includes(',')) {
      throw new ValError('Can not determine CSV delimiter')
    } else {
      delimiter = ';'
    }
  }

  const parsed = parseCSV(csvData, {
    columns: false,
    delimiter,
    skip_empty_lines: true,
  })
  parsed.shift()

  for (const line of parsed) {
    const contentEnc = encrypt(line[1], password)
    texts.push({
      name: line[0].replace(/</g, '&lt'),
      contentOrg: contentEnc,
      contentArr: encrypt(
        JSON.stringify([{ text: line[1], type: 'text' }]),
        password
      ),
      project: projectId,
      version: TEXT_VERSION,
    })
  }

  return texts
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
    throw new ValError('Export path does not exist')
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
      text: getTextFromArr(text.contentArr, password),
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

module.exports = {
  readFolder,
  writeFolder,
  readCSV,
  writeCSV,
  readJSON,
  writeJSON,
}
