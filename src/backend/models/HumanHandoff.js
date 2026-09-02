const mongoose = require("mongoose");


const humanHandoffSchema = new mongoose.Schema(
  {
    // ===================================================
    // ORIGINAL MESSAGE THAT REQUIRED HUMAN HELP
    // ===================================================

    message: {
      type: String,
      required: true,
      trim: true,
    },


    // ===================================================
    // MESSAGE SOURCE
    // ===================================================

    source: {
      type: String,
      default: "admin",
      trim: true,
    },


    // ===================================================
    // EMPLOYEE NAME
    // ===================================================

    employee_name: {
      type: String,
      default: null,
    },


    // ===================================================
    // LINK TO EXISTING CONVERSATION
    //
    // Every Human Handoff must belong to an existing
    // conversation. This does NOT create another chat.
    // ===================================================

    conversation_id: {
      type: String,
      required: true,
      trim: true,
    },


    // ===================================================
    // HANDOFF STATUS
    // ===================================================

    status: {
      type: String,
      enum: [
        "waiting",
        "in_progress",
        "resolved",
      ],
      default: "waiting",
    },


    // ===================================================
    // RESOLUTION TIME
    // ===================================================

    resolved_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);


const HumanHandoff = mongoose.model(
  "HumanHandoff",
  humanHandoffSchema
);


module.exports = HumanHandoff;