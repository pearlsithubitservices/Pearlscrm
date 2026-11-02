const mongoose = require("mongoose");

const hrRecordSchema = new mongoose.Schema(
  {
    module: {
      type: String,
      required: true,
      enum: [
        "recruitment",
        "lifecycle",
        "document",
        "probation",
        "grievance",
        "asset",
        "salaryRevision",
      ],
      index: true,
    },
    employeeId: {
      type: String,
      default: "",
      trim: true,
    },
    employeeName: {
      type: String,
      default: "",
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    status: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    filePath: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

hrRecordSchema.index({ module: 1, updatedAt: -1 });
hrRecordSchema.index({ employeeId: 1, module: 1 });

module.exports = mongoose.model("HRRecord", hrRecordSchema);
