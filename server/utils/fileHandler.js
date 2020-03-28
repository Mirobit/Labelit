const fs = require('fs').promises

const read = async (path, id) => {
  const texts = ''
  const stat = ''

  // Check if path is valid
  try {
    stat = await fs.lstat(path)
  } catch (error) {
    throw new Error('Path does not exist')
  }

  // Check if directory or file
  if (stat.isFile()) {
    texts = await fs.readFile(data.path)
  } else {
    const files = fs.readdir(path, { withFileTypes: true })
    for (const file of files) {
      if (file.isDirectory()) return
      const content = await fs.readFile(file.name)
      texts.push(content)
    }
  }

  // Return specific text
  if (typeof id !== 'undefined') {
    return texts[id]
  } else {
    return texts
  }
}

module.exports = { read }
