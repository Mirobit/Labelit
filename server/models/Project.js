const mongoose = require('mongoose')
const Schema = mongoose.Schema

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    folderPath: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    textCount: {
      type: Number,
      required: true,
    },
    textUpdatedCount: {
      type: Number,
      default: 0,
    },
    progress: {
      type: Number,
      default: 0,
    },
    showConfirmed: {
      type: Boolean,
      default: true,
    },
    categories: [
      {
        name: {
          type: String,
          required: true,
        },
        key: {
          type: String,
          required: true,
        },
        keyUp: {
          type: String,
          required: true,
        },
        color: {
          type: String,
          required: true,
        },
        colorHex: {
          type: String,
          required: true,
        },
      },
    ],
    classActive: {
      type: Boolean,
      default: false,
    },
    classifications: [{ name: { type: String } }],
    texts: [{ type: Schema.Types.ObjectId, ref: 'Text' }],
    words: [
      {
        strEnc: {
          type: String,
          required: true,
        },
        category: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        user: {
          type: Schema.Types.ObjectId,
          required: false,
        },
      },
    ],
    user: { type: Schema.Types.ObjectId, required: false },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
)

module.exports = mongoose.model('Project', projectSchema)
