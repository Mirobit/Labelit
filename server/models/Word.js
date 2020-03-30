const mongoose = require('mongoose')
const Schema = mongoose.Schema

const wordSchema = new Schema(
  {
    hash: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    project: {
      type: Schema.Types.ObjectId,
      required: true
    }
    //user: Schema.Types.ObjectId,
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
)

const Word = mongoose.model('Words', wordSchema)
module.exports = Text
