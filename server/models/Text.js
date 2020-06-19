const mongoose = require('mongoose')
const Schema = mongoose.Schema

const textSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    filePath: {
      type: String,
      required: false,
      default: '',
    },
    contentOrg: {
      type: String,
      required: true,
    },
    contentArr: {
      type: String,
      required: true,
    },
    classifications: [{ type: Schema.Types.ObjectId }],
    status: {
      type: String,
      enum: ['new', 'unconfirmed', 'confirmed'],
      default: 'new',
    },
    // user: { type: Schema.Types.ObjectId, required: true },
    version: {
      type: Number,
      defaut: 0,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
)

module.exports = mongoose.model('Text', textSchema)
