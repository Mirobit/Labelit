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
    folderPath: {
      type: String,
      required: true
    },
    textCount: {
      type: Number,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    textUpdatedCount: {
      type: Number,
      required: false,
      default: 0
    },
    process: {
      type: Number,
      required: false,
      default: 0
    },
    currentText: {
      type: Number,
      required: false,
      default: 0
    },
    categories: [
      {
        //_id: false,
        // TODO unique validation doesn't work -> applies unqiue to all categories in all projects
        name: {
          type: String,
          required: true
        },
        key: {
          type: String,
          required: true
        },
        keyUp: {
          type: String,
          required: true
        },
        color: {
          type: String,
          required: true
        },
        colorHex: {
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
    texts: [{ type: Schema.Types.ObjectId, ref: 'Text' }],
    words: [
      {
        strEnc: {
          type: String,
          required: true
        },
        category: {
          type: Schema.Types.ObjectId,
          required: true
        },
        user: {
          type: Schema.Types.ObjectId,
          required: false
        }
      }
    ],
    user: { type: Schema.Types.ObjectId, required: false }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
)

module.exports = mongoose.model('Project', projectSchema)
