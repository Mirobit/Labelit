const mongoose = require('mongoose')
const Schema = mongoose.Schema

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    textCount: {
      type: Number,
      required: true
    },
    textUpdatedCount: {
      type: Number,
      required: true,
      default: 0
    },
    currentText: {
      type: Number,
      requured: true,
      default: 0
    },
    categories: [
      {
        name: {
          type: String,
          required: true
        },
        key: {
          type: String,
          required: true
        },
        color: {
          type: String,
          required: true
        }
      }
    ],
    classifications: [
      {
        name: {
          type: String,
          required: true
        },
        key: {
          type: String,
          required: true
        },
        color: {
          type: String,
          required: true
        }
      }
    ],
    texts: [Schema.Types.ObjectId],
    words: [Schema.Types.ObjectId]
    //user: Schema.Types.ObjectId,
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
)

const Project = mongoose.model('Projects', projectSchema)
module.exports = Project
