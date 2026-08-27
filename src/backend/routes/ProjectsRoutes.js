const express = require("express");
const router = express.Router();

const Project = require("../models/Projects");

console.log("Projects routes loaded");

// ======================
// GET ALL PROJECTS
// ======================
router.get("/", async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
});

// ======================
// GET PROJECT BY ID
// ======================
router.get("/:id", async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        res.json(project);
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
});

const { getIO } = require("../Socket");

// ======================
// CREATE PROJECT
// ======================
router.post("/", async (req, res) => {
    try {
        const bodyData = { ...req.body };
        if (!bodyData.activities || bodyData.activities.length === 0) {
            bodyData.activities = [
                {
                    title: `Project Created: ${bodyData.title || "New Project"}`,
                    desc: `Project initialized for ${bodyData.company || "Client"}`,
                    time: new Date().toLocaleString(),
                    iconType: "create",
                },
            ];
        }

        if (!bodyData.milestones || bodyData.milestones.length === 0) {
            const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            bodyData.milestones = [
                { title: "Kick-off & discovery", date: todayStr, completed: true },
                { title: "Requirements & design sign-off", date: todayStr, completed: false },
                { title: "Final Delivery & Go-Live", date: "Pending", completed: false },
            ];
        }

        const project = await Project.create(bodyData);
        const io = getIO();
        if (io) {
            io.emit("projectCreated", project);
            io.emit("projectUpdated", project);
        }
        res.status(201).json(project);
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
});

// ======================
// UPDATE PROJECT
// ======================
router.put("/:id", async (req, res) => {
    try {
        const existing = await Project.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: "Project not found" });
        }

        const updateData = { ...req.body };

        // If notes were added, append activity log if not provided
        if (updateData.notes && Array.isArray(updateData.notes) && updateData.notes.length > (existing.notes || []).length) {
            const latestNote = updateData.notes[0] || {};
            const newActivity = {
                title: `New Note Added: ${latestNote.title || "Note"}`,
                desc: latestNote.description || "Note added to project timeline",
                time: new Date().toLocaleString(),
                iconType: "note",
            };
            updateData.activities = [newActivity, ...(existing.activities || updateData.activities || [])];
        }

        // If milestones were updated, append milestone activity log
        if (updateData.milestones && Array.isArray(updateData.milestones)) {
            const newCount = updateData.milestones.length;
            const oldCount = (existing.milestones || []).length;
            if (newCount > oldCount) {
                const addedMs = updateData.milestones[newCount - 1] || updateData.milestones[0];
                const msActivity = {
                    title: `Milestone Added: ${addedMs.title || "New Milestone"}`,
                    desc: `Target Date: ${addedMs.date || "TBD"}`,
                    time: new Date().toLocaleString(),
                    iconType: "note",
                };
                updateData.activities = [msActivity, ...(existing.activities || updateData.activities || [])];
            }
        }

        const project = await Project.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        );

        const io = getIO();
        if (io) {
            io.emit("projectUpdated", project);
        }

        res.json(project);
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
});

// ======================
// DELETE PROJECT
// ======================
router.delete("/:id", async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        const io = getIO();
        if (io) {
            io.emit("projectDeleted", { id: req.params.id });
            io.emit("projectUpdated", { id: req.params.id });
        }

        res.json({
            message: "Project deleted successfully",
        });
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
});

// ======================
// DELETE MEMBER
// ======================
router.delete("/:projectId/member/:uid", async (req, res) => {
    try {
        const { projectId, uid } = req.params;

        const removeActivity = {
            title: "Team Member Removed",
            desc: "A team member was removed from this project",
            time: new Date().toLocaleString(),
            iconType: "user_remove",
        };

        const project = await Project.findByIdAndUpdate(
            projectId,
            {
                $pull: {
                    members: { uid },
                },
                $push: {
                    activities: {
                        $each: [removeActivity],
                        $position: 0,
                    },
                },
            },
            { new: true }
        );

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        const io = getIO();
        if (io) {
            io.emit("projectUpdated", project);
        }

        res.json(project);
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
});

// ======================
// ADD MEMBER TO PROJECT
// ======================
router.put("/:projectId/member", async (req, res) => {
    try {
        const { projectId } = req.params;
        const member = req.body;

        const addActivity = {
            title: `Team Member Added: ${member.name || "Member"}`,
            desc: `Assigned as ${member.role || "Developer"}`,
            time: new Date().toLocaleString(),
            iconType: "user_add",
        };

        const project = await Project.findByIdAndUpdate(
            projectId,
            {
                $push: {
                    members: member,
                    activities: {
                        $each: [addActivity],
                        $position: 0,
                    },
                },
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        const io = getIO();
        if (io) {
            io.emit("projectUpdated", project);
        }

        res.json(project);
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
});

// TEST
router.get("/test", (req, res) => {
    res.send("Projects route working");
});



module.exports = router;