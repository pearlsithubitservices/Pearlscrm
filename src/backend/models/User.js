const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
      default: "",
    },
    lastName: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["Admin", "Employee"],
      default: "Employee",
    },
    industry: {
      type: String,
      enum: ["IT", "Clinic", "Real Estate"],
      default: "IT",
    },
    department: {
      type: String,
      default: "Engineering",
    },
    phone: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Suspended"],
      default: "Active",
    },
    profile: {
      dob: { type: Date },
      gender: { type: String, enum: ["male", "female", "others", ""] , default: "" },
      phone: { type: String, default: "" },
      emergencyNo: { type: String, default: "" },
      empId: { type: String, default: "" },
      address: { type: String, default: "" },
      designation: { type: String, default: "" },
      department: { type: String, default: "" },
      joiningDate: { type: Date },
      reportingManager: { type: String, default: "" },
      workLocation: { type: String, default: "" },
      description: { type: String, default: "" },
      documents: {
        resume: { fileName: String, fileUrl: String, publicId: String },
        panCard: { fileName: String, fileUrl: String, publicId: String },
        aadhaarCard: { fileName: String, fileUrl: String, publicId: String },
        certificates: { fileName: String, fileUrl: String, publicId: String },
        experience: { fileName: String, fileUrl: String, publicId: String },
      },
      bankDetails: {
        accountHolderName: String,
        accountNumber: String,
        bankName: String,
        branchName: String,
        ifscCode: String,
        accountType: String,
      },
      verification: {
        status: String,
        verifiedBy: String,
        verifiedAt: Date,
      },
      salary: {
        basicSalary: Number,
        grossSalary: Number,
        allowances: { type: mongoose.Schema.Types.Mixed },
        deductions: { type: mongoose.Schema.Types.Mixed },
        netSalary: Number,
      },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;