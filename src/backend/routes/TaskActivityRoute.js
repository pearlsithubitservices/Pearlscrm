const express = require("express");
const router = express.Router();

const { getIO } = require("../Socket");

// Create Activity
router.post("/", async (req, res) => {
    try {
        const activity = await Activity.create(req.body);

        const io = getIO();
        if (io) {
            io.emit("taskActivityAdded", activity);
            io.emit("taskUpdated", { taskId: req.body.taskId });
        }

        res.status(201).json({
            success: true,
            data: activity,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});
// Get All Activities (with optional query filters: taskId, employee_uid)
router.get("/", async (req, res) => {
    try {
        const filter = {};
        if (req.query.taskId) {
            filter.taskId = req.query.taskId;
        }
        if (req.query.employee_uid) {
            filter.employee_uid = req.query.employee_uid;
        }

        const activities = await Activity.find(filter).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: activities.length,
            data: activities,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// Get Activities by employee_uid
router.get("/:employee_uid", async (req, res) => {
    try {
        const activities = await Activity.find({
            employee_uid: req.params.employee_uid,
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: activities,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// Update Activity
router.put("/:id", async (req, res) => {
    try {
        const activity = await Activity.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
            }
        );

        res.status(200).json({
            success: true,
            data: activity,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// Delete Activity
router.delete("/:id", async (req, res) => {
    try {
        await Activity.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Activity deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

module.exports = router;