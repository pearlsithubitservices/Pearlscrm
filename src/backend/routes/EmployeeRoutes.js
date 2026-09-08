const express = require('express');

const router = express.Router();

const Employee = require("../models/Employee");

// CREATE EMPLOYEE
router.post("/", async (req, res) => {
    try {
        const {
            employeeName,
            name,
            employeeRole,
            role,
            contact,
            phone,
            email,
            location,
            joinDate,
            notes,
            department,
            employeeDepartment,
            status,
            sme,
        } = req.body;

        const resolvedName = (employeeName || name || "").trim();
        const resolvedEmail = (email || "").trim().toLowerCase();
        const resolvedRole = (employeeRole || role || "Employee").trim();
        const resolvedContact = (contact || phone || "").trim();
        const resolvedDepartment = (department || employeeDepartment || "Engineering").trim();
        const resolvedStatus = status || "Active";

        if (!resolvedName || !resolvedEmail) {
            return res.status(400).json({
                success: false,
                message: "Employee name and email are required",
            });
        }

        // Check if employee already exists by email
        const existingEmployee = await Employee.findOne({ email: resolvedEmail });
        if (existingEmployee) {
            return res.status(409).json({
                success: false,
                message: "An employee with this email already exists",
                data: existingEmployee,
            });
        }

        // Generate empId if not provided
        let assignedEmpId = req.body.empId;
        if (!assignedEmpId) {
            const count = await Employee.countDocuments();
            assignedEmpId = `EMP-${1001 + count}`;
        }

        const employee = await Employee.create({
            employeeName: resolvedName,
            employeeRole: resolvedRole,
            contact: resolvedContact,
            email: resolvedEmail,
            location: location || "",
            joinDate: joinDate ? new Date(joinDate) : new Date(),
            notes: notes || "",
            department: resolvedDepartment,
            status: resolvedStatus,
            empId: assignedEmpId,
            sme: !!sme,
            tasks: [],
        });

        res.status(201).json({
            success: true,
            message: "Employee created successfully",
            data: employee,
        });

    } catch (error) {
        console.error("Create employee error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to create employee",
        });
    }
});

// GET ALL EMPLOYEES
router.get("/", async (req, res) => {
    try {
        const employees = await Employee.find().sort({ createdAt: -1 }).populate("tasks");
        res.json(employees);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// GET SINGLE EMPLOYEE BY ID OR EMAIL
router.get("/:id", async (req, res) => {
    try {
        const mongoose = require("mongoose");
        const id = req.params.id;
        let employee = null;

        if (mongoose.Types.ObjectId.isValid(id)) {
            employee = await Employee.findById(id).populate("tasks");
        }
        if (!employee) {
            employee = await Employee.findOne({
                $or: [{ _id: id }, { email: id.toLowerCase() }, { empId: id }]
            }).populate("tasks");
        }

        if (!employee) {
            const User = require("../models/User");
            let userDoc = null;
            if (mongoose.Types.ObjectId.isValid(id)) {
                userDoc = await User.findById(id).select("-password");
            }
            if (!userDoc) {
                userDoc = await User.findOne({
                    $or: [{ _id: id }, { email: id.toLowerCase() }, { "profile.empId": id }]
                }).select("-password");
            }
            if (userDoc) {
                const u = userDoc.toObject ? userDoc.toObject() : userDoc;
                employee = {
                    ...u,
                    id: u._id,
                    _id: u._id,
                    employeeName: u.name || u.employeeName,
                    employeeRole: u.role || u.employeeRole,
                    salary: u.salary || u.profile?.salary || {},
                    profile: {
                        ...(u.profile || {}),
                        salary: u.salary || u.profile?.salary || {},
                    },
                };
            }
        } else if (employee && employee.email) {
            try {
                const User = require("../models/User");
                const userDoc = await User.findOne({ email: employee.email.toLowerCase() }).select("profile salary");
                if (userDoc) {
                    const u = userDoc.toObject ? userDoc.toObject() : userDoc;
                    const empObj = employee.toObject ? employee.toObject() : employee;
                    const userSal = u.salary || u.profile?.salary || {};
                    const empSal = empObj.salary || empObj.profile?.salary || {};
                    const mergedSal = {
                        ...empSal,
                        ...userSal,
                        allowances: userSal.allowances || empSal.allowances,
                        deductions: userSal.deductions || empSal.deductions,
                        basicSalary: userSal.basicSalary ?? empSal.basicSalary,
                        grossSalary: userSal.grossSalary ?? empSal.grossSalary,
                        netSalary: userSal.netSalary ?? empSal.netSalary,
                    };
                    employee = {
                        ...empObj,
                        salary: mergedSal,
                        profile: {
                            ...(empObj.profile || {}),
                            salary: mergedSal,
                        },
                    };
                }
            } catch (_) {}
        }

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        res.json({
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

// UPDATE EMPLOYEE SALARY
router.put("/:id/salary", require("../controllers/authController").updateUserSalary);

// UPDATE EMPLOYEE
router.put("/:id", async (req, res) => {
    try {
        const mongoose = require("mongoose");
        const id = req.params.id;
        let updated = null;

        const updatePayload = { ...req.body };
        if (req.body.name && !req.body.employeeName) {
            updatePayload.employeeName = req.body.name;
        }
        if (req.body.role && !req.body.employeeRole) {
            updatePayload.employeeRole = req.body.role;
        }
        if (req.body.employeeDepartment && !req.body.department) {
            updatePayload.department = req.body.employeeDepartment;
        }

        if (mongoose.Types.ObjectId.isValid(id)) {
            updated = await Employee.findByIdAndUpdate(id, { $set: updatePayload }, { new: true });
        }
        if (!updated) {
            updated = await Employee.findOneAndUpdate(
                { $or: [{ _id: id }, { email: id.toLowerCase() }, { empId: id }] },
                { $set: updatePayload },
                { new: true }
            );
        }

        // Also update User collection if exists
        try {
            const User = require("../models/User");
            const userUpdate = {};
            if (req.body.name || req.body.employeeName) {
                userUpdate["name"] = req.body.name || req.body.employeeName;
            }
            if (req.body.role || req.body.employeeRole) {
                userUpdate["role"] = (req.body.role || req.body.employeeRole) === "admin" || (req.body.role || req.body.employeeRole) === "Admin" ? "Admin" : "Employee";
            }
            if (req.body.notes !== undefined || req.body.description !== undefined) {
                userUpdate["profile.description"] = req.body.notes || req.body.description;
            }
            if (req.body.contact || req.body.phone) {
                userUpdate["phone"] = req.body.contact || req.body.phone;
                userUpdate["profile.phone"] = req.body.contact || req.body.phone;
            }
            if (req.body.department || req.body.employeeDepartment) {
                userUpdate["department"] = req.body.department || req.body.employeeDepartment;
                userUpdate["profile.department"] = req.body.department || req.body.employeeDepartment;
            }
            if (req.body.status) {
                userUpdate["status"] = req.body.status;
            }
            if (req.body.empId) {
                userUpdate["profile.empId"] = req.body.empId;
            }
            if (req.body.location || req.body.workLocation) {
                userUpdate["profile.workLocation"] = req.body.location || req.body.workLocation;
            }

            // Sync personal details
            if (req.body.dob) userUpdate["profile.dob"] = req.body.dob;
            if (req.body.gender) userUpdate["profile.gender"] = req.body.gender;
            if (req.body.emergencyNo) userUpdate["profile.emergencyNo"] = req.body.emergencyNo;
            if (req.body.address) userUpdate["profile.address"] = req.body.address;
            if (req.body.salary) {
                userUpdate["profile.salary"] = req.body.salary;
                userUpdate["salary"] = req.body.salary;
            }
            if (req.body.profile) {
                Object.keys(req.body.profile).forEach((k) => {
                    userUpdate[`profile.${k}`] = req.body.profile[k];
                });
            }

            // Sync bank details
            if (req.body.bankDetails) {
                userUpdate["profile.bankDetails"] = req.body.bankDetails;
            }

            if (Object.keys(userUpdate).length > 0) {
                if (mongoose.Types.ObjectId.isValid(id)) {
                    await User.findByIdAndUpdate(id, { $set: userUpdate });
                } else {
                    await User.findOneAndUpdate({ email: (updated?.email || id).toLowerCase() }, { $set: userUpdate });
                }
            }
        } catch (userSyncErr) {
            console.warn("User sync warning on employee update:", userSyncErr.message);
        }

        res.status(200).json({ success: true, message: "Employee updated successfully", data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE EMPLOYEE
router.delete("/:id", async (req, res) => {
    try {
        const mongoose = require("mongoose");
        const id = req.params.id;
        let deleted = null;

        if (mongoose.Types.ObjectId.isValid(id)) {
            deleted = await Employee.findByIdAndDelete(id);
        }
        if (!deleted) {
            deleted = await Employee.findOneAndDelete({
                $or: [{ _id: id }, { email: id }]
            });
        }

        // Also remove from User collection if present
        try {
            const User = require("../models/User");
            if (mongoose.Types.ObjectId.isValid(id)) {
                await User.findByIdAndDelete(id);
            } else {
                await User.findOneAndDelete({ email: id });
            }
        } catch (_) {}

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
