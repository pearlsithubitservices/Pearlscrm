const express = require("express");
const router = express.Router();
const Benefit = require("../models/Payroll&Benefits/Benefit");
const Notification = require("../models/CommunicationModels/Notifications");
const { getIO } = require("../Socket");

// GET ALL BENEFITS
router.get("/", async (req, res) => {
  try {
    const benefits = await Benefit.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: benefits });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// CREATE BENEFIT
router.post("/", async (req, res) => {
  try {
    const { title, subtitle, category, provider, coverAmount, contribution, footer } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Benefit title is required" });
    }

    const newBenefit = await Benefit.create({
      title,
      subtitle: subtitle || "",
      category: category || "General",
      provider: provider || "Company Standard",
      coverAmount: coverAmount || "N/A",
      contribution: contribution || "Company Funded",
      footer: footer || "",
      status: "Active",
    });

    // Broadcast to every employee that a new benefit/perk is now available
    const notifData = {
      title: "New Benefit Added",
      sub: `${newBenefit.title} is now available under ${newBenefit.category}.`,
      notificationType: "Benefits",
      employeeId: null,
    };
    await Notification.create(notifData).catch((err) =>
      console.error("Notification creation failed:", err)
    );

    const io = getIO();
    if (io) {
      io.emit("newNotification", notifData);
    }

    res.status(201).json({ success: true, data: newBenefit, message: "Benefit created successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE BENEFIT
router.put("/:id", async (req, res) => {
  try {
    const updated = await Benefit.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Benefit not found" });
    }

    // Broadcast the update so employees see the latest policy details
    const notifData = {
      title: "Benefit Updated",
      sub: `${updated.title} details have been updated. Please review the latest terms.`,
      notificationType: "Benefits",
      employeeId: null,
    };
    await Notification.create(notifData).catch((err) =>
      console.error("Notification creation failed:", err)
    );

    const io = getIO();
    if (io) {
      io.emit("newNotification", notifData);
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE BENEFIT
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Benefit.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Benefit not found" });
    }
    res.status(200).json({ success: true, message: "Benefit deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;