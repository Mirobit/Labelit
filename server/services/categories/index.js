const Category = require('../../models/Category')

const get = async name => {
  try {
    const category = await Category.findOne({ name })
    return category
  } catch (error) {
    throw new Error(error.message)
  }
}

const list = async () => {
  try {
    const categories = await Category.find({}) // .select({ "name": 1, "_id": 0})
    return categories
  } catch (error) {
    throw new Error(error.message)
  }
}

const create = async data => {
  try {
    await new Category(data).save()
    return true
  } catch (error) {
    throw new Error(error.message)
  }
}

const update = async data => {
  try {
    const category = await Category.findOneAndUpdate(
      { name: data.name },
      data,
      {
        new: true,
        runValidators: true
      }
    )
    return category
  } catch (error) {
    throw new Error(error.message)
  }
}

const remove = async name => {
  try {
    return await Category.findOneAndDelete({ name })
  } catch (error) {
    throw new Error(error.message)
  }
}

module.exports = { get, list, create, update, remove }
