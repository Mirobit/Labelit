const fs = require('fs').promises
const path = require('path')
const { encrypt, decrypt } = require('./crypter')

const read = async (folderPath, projectId, password) => {
  let stat
  let textCount = 0
  const texts = []

  // Check if path is valid
  try {
    stat = await fs.lstat(folderPath)
  } catch (error) {
    throw new Error('Path does not exist')
  }

  // Check if directory or file
  if (stat.isFile()) {
    const content = await fs.readFile(folderPath)
    texts[0] = { name: stat.name, content, project: projectId }
  } else {
    const files = await fs.readdir(folderPath, { withFileTypes: true })
    for (const file of files) {
      if (file.isDirectory()) return
      textCount++
      const content = await fs.readFile(
        path.join(folderPath, file.name),
        'utf8'
      )
      const contentEnc = encrypt(content, password)
      texts.push({
        name: file.name,
        contentEncOrg: contentEnc,
        contentEncSaved: contentEnc,
        contentEncHtml: contentEnc,
        project: projectId,
      })
    }
  }

  return { textCount, texts }
}

const write = async (folderPath, projectName, texts, password) => {
  try {
    stat = await fs.lstat(folderPath)
  } catch (error) {
    throw new Error('Path does not exist')
  }
  const totalPath = path.join(folderPath, `LabeliT - ${projectName}`)
  await fs.mkdir(totalPath, { recursive: true })
  for (const text of texts) {
    if (text.status !== 'confirmed') return
    fs.writeFile(
      path.join(totalPath, text.name),
      decrypt(text.contentEncSaved, password)
    )
  }
}

module.exports = { read, write }
