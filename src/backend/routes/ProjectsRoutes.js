const express = require("express");
const router = express.Router();

const Project = require("../models/Projects");


console.log("projects loaded");
//GET ALL PROJECTS
router.get("/", async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
    }
    catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
});

// CREATE PROJECT
router.post("/", async (req, res) => {
    try {
        const project = await Project.create(req.body);
        res.json(project);
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
});

router.get("/test", (req, res) => {
    res.send("Projects route working");
});

module.exports=router;