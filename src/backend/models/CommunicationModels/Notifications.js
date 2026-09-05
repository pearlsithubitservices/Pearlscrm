const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    sub: {
      type: String,
      required: true,
      trim: true,
      default: "HR Manager",
    },

    notificationType: {
      type: String,
      enum: [
        "Leave",
        "Payroll",
        "Benefits",
        "Tax",
        "Reimbursement",
        "Meeting",
        "Lead",
        "General",
      ],
      default: "General",
    },

    employeeId: {
      type: String,
      default: null,
    },
    senderId: {
      type: String,
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    isImportant: {
      type: Boolean,
      default: true,
    },

    time: {
      type: String,
      default: () => {
        return new Date().toLocaleString();
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);