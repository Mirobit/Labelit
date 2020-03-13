const mongoose = require("mongoose")
const Schema = mongoose.Schema

const projectSchema = new Schema(
  {
    title: {
      type: String,
      required: true
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
        required: true  
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
            color: {
                type: String,
                required: true,
            },
        },
    ],
    classifications: [
        {
            name: {
                type: String,
                required: true,
            },
            key: {
                type: String,
                required: true,
            },
            color: {
                type: String,
                required: true,
            },
        },
    ],
    //user: Schema.Types.ObjectId,
    //texts: [Schema.Types.ObjectId],
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
)

const Project = mongoose.model("Projects", projectSchema)
module.exports = Project