const express = require("express");
const router = express.Router();
const Payslip = require("../models/Payroll&Benefits/Payslip");
const Notification = require("../models/CommunicationModels/Notifications");
const { getIO } = require("../Socket");

// CREATE PAYSLIP
router.post("/", async (req, res) => {
  try {
    const payslip = await Payslip.create(req.body);

    const empId = req.body.employeeId || req.body.employee_uid || req.body.uid;
    if (empId) {
      const notifData = {
        title: "New Payslip Published",
        sub: `Your payslip for ${req.body.month || req.body.payPeriod || 'the pay period'} has been published.`,
        notificationType: "Payroll",
        employeeId: empId,
      };
      await Notification.create(notifData).catch((err) => console.error("Notification creation failed:", err));

      const io = getIO();
      if (io) {
        io.to("user_" + empId).emit("newNotification", notifData);
        io.emit("newNotification", notifData);
      }
    }

    res.status(201).json(payslip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ALL PAYSLIPS
router.get("/", async (req, res) => {
  try {
    const payslips = await Payslip.find().sort({ createdAt: -1 });
    res.json(payslips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE PAYSLIP STATUS
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const payslip = await Payslip.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!payslip) {
      return res.status(404).json({ message: "Payslip not found" });
    }
    res.json(payslip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE PAYSLIP FULL
router.put("/:id", async (req, res) => {
  try {
    const payslip = await Payslip.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!payslip) {
      return res.status(404).json({ message: "Payslip not found" });
    }
    res.json(payslip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE PAYSLIP
router.delete("/:id", async (req, res) => {
  try {
    const payslip = await Payslip.findByIdAndDelete(req.params.id);
    if (!payslip) {
      return res.status(404).json({ message: "Payslip not found" });
    }
    res.json({ message: "Payslip deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;