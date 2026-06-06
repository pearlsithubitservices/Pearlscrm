const express = require("express");
const router = express.Router();

const Leave = require("../models/LeaveModels/Leavemanegement");

// Create Leave Request


router.post("/", async (req, res) => {
    try {
        const {
            leaveTitle,
            leaveReason,
            leaveFrom,
            leaveTo,
            leaveDays,
            employeeName,
            employeeId,
            managerName,
            managerId,
            department,
            leaveType,
        } = req.body;

        // Validation
        

        const leave = await Leave.create({
            leaveTitle,
            leaveReason,
            leaveFrom,
            leaveTo,
            leaveDays,
            employeeName,
            employeeId,
            managerName,
            managerId,
            leaveType,
            department,
            status: "Pending",
        });

        res.status(201).json({
            success: true,
            message: "Leave request submitted successfully",
            leave,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});


// Get All Leave Requests
router.get("/", async (req, res) => {
    try {
        const leave = await Leave.find().sort({
            createdAt: -1,
        });

        res.json(leave);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});


//UPDATE LEAVE REQUEST

router.put("/:id", async (req, res) => {
  try {
    const updatedLeave = await Leave.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedLeave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    res.status(200).json({
      success: true,
      leave: updatedLeave,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
module.exports = router;