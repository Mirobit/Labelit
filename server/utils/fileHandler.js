const fs = require('fs').promises
const path = require('path')
const { encrypt } = require('./crypter')

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
      texts.push({
        name: file.name,
        contentEnc: encrypt(content, password),
        project: projectId
      })
    }
  }

  return { textCount, texts }
}

module.exports = { read }
