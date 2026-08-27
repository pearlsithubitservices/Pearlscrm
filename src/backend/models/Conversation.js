const mongoose = require("mongoose");

// =========================================================
// MESSAGE SCHEMA
// =========================================================

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ["customer", "ai", "agent"],
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);


// =========================================================
// CONVERSATION SCHEMA
// =========================================================

const conversationSchema = new mongoose.Schema(
  {
    // -----------------------------------------------------
    // CONTACT INFORMATION
    // -----------------------------------------------------

    contactId: {
      type: String,
      required: true,
      trim: true,
    },

    contactName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
    },


    // -----------------------------------------------------
    // CRM INFORMATION
    // -----------------------------------------------------

    crmUserId: {
      type: String,
      default: "",
      trim: true,
    },

    department: {
      type: String,
      default: "",
      trim: true,
    },


    // -----------------------------------------------------
    // CONVERSATION INFORMATION
    // -----------------------------------------------------

    status: {
      type: String,
      enum: [
        "Completed",
        "In Progress",
        "Blocked",
      ],
      default: "In Progress",
    },

    intent: {
      type: String,
      default: "General Query",
      trim: true,
    },

    channel: {
      type: String,
      default: "WhatsApp",
      trim: true,
    },


    // -----------------------------------------------------
    // WHO IS HANDLING THE CONVERSATION
    // -----------------------------------------------------

    handledBy: {
      type: String,
      enum: [
        "AI",
        "Human",
      ],
      default: "AI",
    },


    // -----------------------------------------------------
    // MESSAGES
    // -----------------------------------------------------

    messages: {
      type: [messageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);


// =========================================================
// EXPORT
// =========================================================

module.exports = mongoose.model(
  "Conversation",
  conversationSchema
);