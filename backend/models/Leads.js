const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: String,
    company: String,
    phone: String,
    email: String,
    service: String,
    status: String,
    assignedTo: String,
    notes: String,
  },
  { timestamps: true }
);
const createLead = async () => {

  const response = await fetch(
    "https://pearlscrm.onrender.com/api/leads",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        name: "Ragavi",
        company: "Pearls IT Hub",
        phone: "8015613840",
        email: "test@gmail.com",
        service: "CRM",
        status: "Interested",
        assignedTo: "Sakthi",
      }),
    }
  );

  const data = await response.json();

  console.log(data);
};

module.exports = mongoose.model("Lead", leadSchema);