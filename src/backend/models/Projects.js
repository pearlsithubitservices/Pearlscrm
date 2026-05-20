const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: true,
      trim: true,
    },
    companylocation:{
      type:String,
      required:true,
      trim:true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    members: [
      {
        type: String,
      }
    ],

    assignedDate: {
      type: Date,
    },

    dueDate: {
      type: Date,
    },

    leader: {
      type: String,
      default: "",
    },

    budget: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "In Progress",
        "Completed",
        "On Hold"
      ],
      default: "Pending",
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    }

  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Project",
  projectSchema
);