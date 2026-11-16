
const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Employee = require("../models/Employee");
const TotalLeave = require("../models/LeaveModels/TotalLeaveModel");
const { DEFAULT_DEPARTMENT } = require("../config/departments");

// =====================================================
// CREATE EMPLOYEE
// =====================================================
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
        const resolvedDepartment = (
            department ||
            employeeDepartment ||
            DEFAULT_DEPARTMENT
        ).trim();
        const resolvedStatus = status || "Active";

        if (!resolvedName || !resolvedEmail) {
            return res.status(400).json({
                success: false,
                message: "Employee name and email are required",
            });
        }

        // Check whether employee already exists
        const existingEmployee = await Employee.findOne({
            email: resolvedEmail,
        });

        if (existingEmployee) {
            return res.status(409).json({
                success: false,
                message: "An employee with this email already exists",
                data: existingEmployee,
            });
        }

        // Generate employee ID if not provided
        let assignedEmpId = req.body.empId;

        if (!assignedEmpId) {
            const count = await Employee.countDocuments();
            assignedEmpId = `EMP-${1001 + count}`;
        }

        // Create employee
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

        // Create default leave balance for the new employee.
        // $setOnInsert preserves an existing balance if one is already present.
        try {
            await TotalLeave.findOneAndUpdate(
                {
                    employeeId: employee._id.toString(),
                },
                {
                    $setOnInsert: {
                        personalLeave: 10,
                        sickLeave: 15,
                        annualLeave: 12,
                    },
                },
                {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true,
                }
            );
        } catch (leaveError) {
            // Log the error without hiding that the employee was created.
            console.error(
                "Employee created, but leave balance initialization failed:",
                leaveError
            );
        }

        return res.status(201).json({
            success: true,
            message: "Employee created successfully",
            data: employee,
        });
    } catch (error) {
        console.error("Create employee error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to create employee",
        });
    }
});

// =====================================================
// GET ALL EMPLOYEES
// =====================================================
router.get("/", async (req, res) => {
    try {
        const employees = await Employee.find()
            .sort({ createdAt: -1 })
            .populate("tasks");

        return res.status(200).json(employees);
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
});

// =====================================================
// GET SINGLE EMPLOYEE BY ID, EMAIL OR EMPLOYEE CODE
// =====================================================
router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        let employee = null;

        if (mongoose.Types.ObjectId.isValid(id)) {
            employee = await Employee.findById(id).populate("tasks");
        }

        if (!employee) {
            employee = await Employee.findOne({
                $or: [
                    { email: id.toLowerCase() },
                    { empId: id },
                ],
            }).populate("tasks");
        }

        // If no Employee document is found, check the User collection.
        if (!employee) {
            const User = require("../models/User");
            let userDoc = null;

            if (mongoose.Types.ObjectId.isValid(id)) {
                userDoc = await User.findById(id).select("-password");
            }

            if (!userDoc) {
                userDoc = await User.findOne({
                    $or: [
                        { email: id.toLowerCase() },
                        { "profile.empId": id },
                    ],
                }).select("-password");
            }

            if (userDoc) {
                const user = userDoc.toObject();

                employee = {
                    ...user,
                    id: user._id,
                    _id: user._id,
                    employeeName: user.name || user.employeeName,
                    employeeRole: user.role || user.employeeRole,
                    salary: user.salary || user.profile?.salary || {},
                    profile: {
                        ...(user.profile || {}),
                        salary: user.salary || user.profile?.salary || {},
                    },
                };
            }
        } else if (employee.email) {
            // Merge salary information from the User record when available.
            try {
                const User = require("../models/User");

                const userDoc = await User.findOne({
                    email: employee.email.toLowerCase(),
                }).select("profile salary");

                if (userDoc) {
                    const user = userDoc.toObject();
                    const empObj = employee.toObject();

                    const userSalary =
                        user.salary || user.profile?.salary || {};
                    const employeeSalary =
                        empObj.salary || empObj.profile?.salary || {};

                    const mergedSalary = {
                        ...employeeSalary,
                        ...userSalary,
                        allowances:
                            userSalary.allowances ||
                            employeeSalary.allowances,
                        deductions:
                            userSalary.deductions ||
                            employeeSalary.deductions,
                        basicSalary:
                            userSalary.basicSalary ??
                            employeeSalary.basicSalary,
                        grossSalary:
                            userSalary.grossSalary ??
                            employeeSalary.grossSalary,
                        netSalary:
                            userSalary.netSalary ??
                            employeeSalary.netSalary,
                    };

                    employee = {
                        ...empObj,
                        salary: mergedSalary,
                        profile: {
                            ...(empObj.profile || {}),
                            salary: mergedSalary,
                        },
                    };
                }
            } catch (userSyncError) {
                console.warn(
                    "Could not merge employee salary details:",
                    userSyncError.message
                );
            }
        }

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: employee,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// =====================================================
// UPDATE EMPLOYEE SALARY
// =====================================================
router.put(
    "/:id/salary",
    require("../controllers/authController").updateUserSalary
);

// =====================================================
// UPDATE EMPLOYEE
// =====================================================
router.put("/:id", async (req, res) => {
    try {
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
            updated = await Employee.findByIdAndUpdate(
                id,
                { $set: updatePayload },
                { new: true, runValidators: true }
            );
        }

        if (!updated) {
            updated = await Employee.findOneAndUpdate(
                {
                    $or: [
                        { email: id.toLowerCase() },
                        { empId: id },
                    ],
                },
                { $set: updatePayload },
                { new: true, runValidators: true }
            );
        }

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        // Synchronize supported fields with the User collection.
        try {
            const User = require("../models/User");
            const userUpdate = {};

            if (req.body.name || req.body.employeeName) {
                userUpdate.name =
                    req.body.name || req.body.employeeName;
            }

            if (req.body.role || req.body.employeeRole) {
                const role = req.body.role || req.body.employeeRole;

                userUpdate.role =
                    role === "admin" || role === "Admin"
                        ? "Admin"
                        : "Employee";
            }

            if (
                req.body.notes !== undefined ||
                req.body.description !== undefined
            ) {
                userUpdate["profile.description"] =
                    req.body.notes || req.body.description;
            }

            if (req.body.contact || req.body.phone) {
                const phone = req.body.contact || req.body.phone;
                userUpdate.phone = phone;
                userUpdate["profile.phone"] = phone;
            }

            if (req.body.department || req.body.employeeDepartment) {
                const department =
                    req.body.department || req.body.employeeDepartment;

                userUpdate.department = department;
                userUpdate["profile.department"] = department;
            }

            if (req.body.status) {
                userUpdate.status = req.body.status;
            }

            if (req.body.empId) {
                userUpdate["profile.empId"] = req.body.empId;
            }

            if (req.body.location || req.body.workLocation) {
                userUpdate["profile.workLocation"] =
                    req.body.location || req.body.workLocation;
            }

            // Synchronize personal details
            if (req.body.dob) {
                userUpdate["profile.dob"] = req.body.dob;
            }

            if (req.body.gender) {
                userUpdate["profile.gender"] = req.body.gender;
            }

            if (req.body.emergencyNo) {
                userUpdate["profile.emergencyNo"] = req.body.emergencyNo;
            }

            if (req.body.address) {
                userUpdate["profile.address"] = req.body.address;
            }

            if (req.body.salary) {
                userUpdate["profile.salary"] = req.body.salary;
                userUpdate.salary = req.body.salary;
            }

            if (req.body.profile) {
                Object.keys(req.body.profile).forEach((key) => {
                    userUpdate[`profile.${key}`] = req.body.profile[key];
                });
            }

            // Synchronize bank details
            if (req.body.bankDetails) {
                userUpdate["profile.bankDetails"] = req.body.bankDetails;
            }

            if (Object.keys(userUpdate).length > 0) {
                if (mongoose.Types.ObjectId.isValid(id)) {
                    await User.findByIdAndUpdate(id, {
                        $set: userUpdate,
                    });
                } else {
                    await User.findOneAndUpdate(
                        {
                            email: (updated.email || id).toLowerCase(),
                        },
                        { $set: userUpdate }
                    );
                }
            }
        } catch (userSyncError) {
            console.warn(
                "User sync warning on employee update:",
                userSyncError.message
            );
        }

        return res.status(200).json({
            success: true,
            message: "Employee updated successfully",
            data: updated,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// =====================================================
// DELETE EMPLOYEE
// =====================================================
router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        let deleted = null;

        if (mongoose.Types.ObjectId.isValid(id)) {
            deleted = await Employee.findByIdAndDelete(id);
        }

        if (!deleted) {
            deleted = await Employee.findOneAndDelete({
                $or: [
                    { email: id.toLowerCase() },
                    { empId: id },
                ],
            });
        }

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        // Preserve the original behavior of removing the linked User.
        try {
            const User = require("../models/User");

            if (deleted.email) {
                await User.findOneAndDelete({
                    email: deleted.email.toLowerCase(),
                });
            }
        } catch (userDeleteError) {
            console.warn(
                "User deletion warning:",
                userDeleteError.message
            );
        }

        return res.status(200).json({
            success: true,
            message: "Employee deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

module.exports = router;
