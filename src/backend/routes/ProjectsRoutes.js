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

// ======================
// CREATE PROJECT
// ======================
router.post("/", async (req, res) => {
    try {
        const project = await Project.create(req.body);
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
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
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

        const project = await Project.findByIdAndUpdate(
            projectId,
            {
                $pull: {
                    members: { uid },
                },
            },
            { new: true }
        );

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
// ======================
// ADD MEMBER TO PROJECT
// ======================
router.put("/:projectId/member", async (req, res) => {
    try {
        const { projectId } = req.params;
        const member = req.body;

        const project = await Project.findByIdAndUpdate(
            projectId,
            {
                $push: {
                    members: member,
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