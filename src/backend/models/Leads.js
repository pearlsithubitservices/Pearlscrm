const mongoose =
  require("mongoose");

const leadSchema =
  new mongoose.Schema(
    {

      name: {
        type: String,
      },

      company: {
        type: String,
      },

      phone: {
        type: String,
      },

      email: {
        type: String,
      },

      website: {
        type: String,
      },

      source: {
        type: String,
      },

      budget: {
        type: String,
      },

      platform: {
        type: String,
      },

      nextAction: {
        type: String,
      },

      service: {
        type: String,
      },

      status: {
        type: String,
        default: "New",
      },

      assignedTo: {
        type: String,
        default: "",
      },
      assignedEmployee: {
        type:String,
        default: "",
      },

      notes: {
        type: String,
      },


      followUpCount: {
        type: Number,
        default: 0,
      },

      priority: {
        type: String,
        default: "Cold",
      }


    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "Lead",
    leadSchema
  );