const mongoose = require('mongoose')
const Schema = mongoose.Schema

const textSchema = new Schema(
  {
    externalId: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: false
    },
    originalText: {
      type: String,
      required: false
    },
    updatedText: {
      type: String,
      required: true
    },
    updatedTextHtml: {
      type: String,
      required: true
    },
    classification: {
      type: String,
      required: false
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

const Text = mongoose.model('Texts', textSchema)
module.exports = Text
