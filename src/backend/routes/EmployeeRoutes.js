const express = require('express');

const router = express.Router();

const Employee = require("../models/Employee");

//CREATE EMPLOYEE

router.post("/", async (req, res) => {
    try {
        const {
            employeeName,
            employeeRole,
            contact,
            email,
            location,
            joinDate,
            notes,
        } = req.body;

        const employee = await Employee.create({
            employeeName,
            employeeRole,
            contact,
            email,
            location,
            joinDate,
            notes,
            tasks: [], // important default
        });

        res.status(201).json({
            success: true,
            data: employee,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});


//GET EMPLOYEE

router.get("/",
    async (req, res) => {
        try {
            const employee = await Employee.find().sort({ createdAt: -1 }).populate("tasks");
            res.json(employee);
        }
        catch (error) {
            res.status(500).json({
                message:error.message
            });
         }
    }
);

// DELETE EMPLOYEE
router.delete("/:id", async (req, res) => {
    try {
        await Employee.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Employee deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// GET SINGLE EMPLOYEE
router.get("/:id", async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id)
            .populate("tasks");

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        res.status(200).json(employee);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});
// UPDATE EMPLOYEE
router.put("/:id", async (req, res) => {
    try {
        const updatedEmployee =
            await Employee.findByIdAndUpdate(
                req.params.id,
                {
                    employeeName: req.body.employeeName,
                    employeeRole: req.body.employeeRole,
                    contact: req.body.contact,
                    email: req.body.email,
                    location: req.body.location,
                    joinDate: req.body.joinDate,
                    notes: req.body.notes,
                },
                {
                    new: true,
                    runValidators: true,
                }
            );

        if (!updatedEmployee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        res.status(200).json(updatedEmployee);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});
module.exports = router;