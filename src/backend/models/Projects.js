const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["Leader", "Developer", "Designer", "Tester", "Manager"],
      default: "Developer",
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { _id: false }
);

const milestoneSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: String, default: "" },
    completed: { type: Boolean, default: false },
  },
  { _id: true, timestamps: true }
);

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    date: { type: String, default: "" },
  },
  { _id: true, timestamps: true }
);

const activitySchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    desc: { type: String, default: "" },
    time: { type: String, default: "" },
    iconType: { type: String, default: "default" },
  },
  { _id: true, timestamps: true }
);

const projectSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: true,
      trim: true,
    },

    companylocation: {
      type: String,
      required: true,
      trim: true,
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

    members: [memberSchema],
    notes: [noteSchema],
    activities: [activitySchema],
    milestones: [milestoneSchema],

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
        "On Hold",
      ],
      default: "Pending",
    },

    priority: {
      type: String,
      default: "Medium",
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Project", projectSchema);