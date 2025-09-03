const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    description: { 
      type: String, 
      trim: true,
      default: ""
    },
    repositoryUrl: { 
      type: String, 
      trim: true,
      default: ""
    },
    owner: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    collaborators: [{ 
      user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
      },
      role: { 
        type: String, 
        enum: ["viewer", "contributor", "admin"],
        default: "viewer"
      },
      addedAt: { 
        type: Date, 
        default: Date.now 
      }
    }],
    isPrivate: { 
      type: Boolean, 
      default: false 
    },
    tags: [{ 
      type: String, 
      trim: true 
    }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);