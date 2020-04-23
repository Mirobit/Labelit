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
    contentEncOrg: {
      type: String,
      required: true,
    },
    contentEncSaved: {
      type: String,
      required: false,
    },
    contentEncHtml: {
      type: String,
      required: false,
    },
    classifications: [{ type: Schema.Types.ObjectId }],
    status: {
      type: String,
      enum: ['new', 'unconfirmed', 'confirmed'],
      default: 'new',
    },
    // user: { type: Schema.Types.ObjectId, required: true }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
)

module.exports = mongoose.model('Text', textSchema)
