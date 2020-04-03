const Word = require('../../models/Word')

const getWordlist = async projectId => {
  try {
    const words = await Word.find({ project: projectId }) // .select({ "name": 1, "_id": 0})
    return words
  } catch (error) {
    throw new Error(error.message)
  }
}

const updateWordlist = async (projectId, words) => {
  try {
    // ToDo do "parallel" with promise all
    for (const word of words) {
      await new Word({
        project: word.projectId,
        hash: word.hash,
        category: word.category
      }).save()
    }
    return true
  } catch (error) {
    throw new Error(error.message)
  }
}

const resetWordlist = async projectId => {
  try {
    return await Word.deleteMany({ project: projectId })
  } catch (error) {
    throw new Error(error.message)
  }
}

module.exports = { getWordlist, updateWordlist, resetWordlist }
