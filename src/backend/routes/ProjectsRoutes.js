const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

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
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

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

const Notification = require("../models/CommunicationModels/Notifications");

// Helper function to send notification to team member
const sendProjectNotification = async (empId, title, sub = "Project Management") => {
    if (!empId) return;
    try {
        const notif = await Notification.create({
            title,
            sub,
            notificationType: "General",
            employeeId: String(empId),
        });

        const io = getIO();
        if (io) {
            io.to(`user_${empId}`).emit("newNotification", notif);
            io.to(String(empId)).emit("newNotification", notif);
        }
    } catch (err) {
        console.warn("Could not create project notification:", err.message);
    }
};

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

        // Clean empty ObjectId / Date fields
        if (!bodyData.clientId || bodyData.clientId === "") {
            delete bodyData.clientId;
        }
        if (!bodyData.assignedDate || bodyData.assignedDate === "") {
            delete bodyData.assignedDate;
        }
        if (!bodyData.dueDate || bodyData.dueDate === "") {
            delete bodyData.dueDate;
        }

        if (!bodyData.company || !bodyData.company.trim()) {
            return res.status(400).json({ message: "Company name is required" });
        }
        if (!bodyData.companylocation || !bodyData.companylocation.trim()) {
            bodyData.companylocation = "Location Not Specified";
        }
        if (!bodyData.title || !bodyData.title.trim()) {
            return res.status(400).json({ message: "Project title is required" });
        }

        const project = await Project.create(bodyData);
        const io = getIO();
        if (io) {
            io.emit("projectCreated", project);
            io.emit("projectUpdated", project);
        }

        // Send notifications to assigned members
        if (Array.isArray(project.members)) {
            project.members.forEach((m) => {
                const targetId = m.uid || m._id || m.id;
                sendProjectNotification(targetId, `Assigned to new Project: ${project.title}`);
            });
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
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: "Project not found" });
        }
        const existing = await Project.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: "Project not found" });
        }

        const updateData = { ...req.body };

        if (!updateData.clientId || updateData.clientId === "") {
            delete updateData.clientId;
        }
        if (!updateData.assignedDate || updateData.assignedDate === "") {
            delete updateData.assignedDate;
        }
        if (!updateData.dueDate || updateData.dueDate === "") {
            delete updateData.dueDate;
        }

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

        // If milestones were updated, append milestone activity log & auto-calculate progress
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

            // Auto progress calculation
            if (newCount > 0) {
                const completedCount = updateData.milestones.filter((m) => m.completed).length;
                updateData.progress = Math.round((completedCount / newCount) * 100);
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
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: "Project not found" });
        }
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

        const targetId = member.uid || member._id || member.id;
        if (targetId) {
            sendProjectNotification(targetId, `You were added to Project: ${project.title} (${member.role || "Developer"})`);
        }

        res.json(project);
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
});

// ======================
// ADD DOCUMENT TO PROJECT
// ======================
router.post("/:projectId/documents", async (req, res) => {
    try {
        const { projectId } = req.params;
        const { name, url, type, size, uploadedBy } = req.body;

        if (!name || !url) {
            return res.status(400).json({ message: "Document name and URL are required" });
        }

        const newDoc = {
            name,
            url,
            type: type || "file",
            size: size || "N/A",
            uploadedBy: uploadedBy || "User",
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        };

        const docActivity = {
            title: `Document Uploaded: ${name}`,
            desc: `Uploaded by ${newDoc.uploadedBy}`,
            time: new Date().toLocaleString(),
            iconType: "note",
        };

        const project = await Project.findByIdAndUpdate(
            projectId,
            {
                $push: {
                    documents: newDoc,
                    activities: {
                        $each: [docActivity],
                        $position: 0,
                    },
                },
            },
            { new: true }
        );

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const io = getIO();
        if (io) {
            io.emit("projectUpdated", project);
        }

        res.status(201).json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ======================
// DELETE DOCUMENT FROM PROJECT
// ======================
router.delete("/:projectId/documents/:documentId", async (req, res) => {
    try {
        const { projectId, documentId } = req.params;

        const removeDocActivity = {
            title: "Document Removed",
            desc: "A document was deleted from this project",
            time: new Date().toLocaleString(),
            iconType: "user_remove",
        };

        const project = await Project.findByIdAndUpdate(
            projectId,
            {
                $pull: {
                    documents: { _id: documentId },
                },
                $push: {
                    activities: {
                        $each: [removeDocActivity],
                        $position: 0,
                    },
                },
            },
            { new: true }
        );

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const io = getIO();
        if (io) {
            io.emit("projectUpdated", project);
        }

        res.json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// TEST
router.get("/test", (req, res) => {
    res.send("Projects route working");
});

module.exports = router;