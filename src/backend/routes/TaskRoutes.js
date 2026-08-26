const express = require("express");
const router = express.Router();
const Task = require("../models/TaskModels/Task");
const Notification = require("../models/CommunicationModels/Notifications");
const { getIO } = require("../Socket");

// Create Task
router.post("/", async (req, res) => {
  try {
    const task = await Task.create(req.body);

    // Broadcast Socket Event for Real-time Sync
    const io = getIO();
    if (io) {
      io.emit("taskUpdated", task);
      io.emit("taskCreated", task);
    }

    // Create Notification for Assigned Employee
    let targetEmployeeId = null;
    if (task.assignedTo) {
      if (typeof task.assignedTo === "object") {
        targetEmployeeId = task.assignedTo._id || task.assignedTo.id || task.assignedTo.uid;
      } else {
        targetEmployeeId = task.assignedTo;
      }
    }

    if (targetEmployeeId) {
      try {
        const notif = await Notification.create({
          title: `New Task Assigned: ${task.title || "Task"}`,
          sub: "Task Management",
          notificationType: "General",
          employeeId: String(targetEmployeeId),
        });

        if (io) {
          io.to(`user_${targetEmployeeId}`).emit("newNotification", notif);
          io.to(String(targetEmployeeId)).emit("newNotification", notif);
        }
      } catch (notifErr) {
        console.warn("Error creating task assignment notification:", notifErr.message);
      }
    }

    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get All Tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 }).lean();

    // Fetch employees & users safely to resolve assignedTo whether it's an ObjectId, UID, email, or string name
    const Employee = require("../models/Employee");
    const User = require("../models/User");
    let employees = [];
    let users = [];
    try {
      employees = await Employee.find().lean();
    } catch (e) {
      console.warn("Could not fetch employees for Task lookup:", e.message);
    }
    try {
      users = await User.find().lean();
    } catch (e) {
      console.warn("Could not fetch users for Task lookup:", e.message);
    }

    const employeeMap = {};
    employees.forEach((emp) => {
      const name = emp.employeeName || emp.name || emp.email;
      if (emp._id) employeeMap[emp._id.toString()] = emp;
      if (emp.id) employeeMap[emp.id.toString()] = emp;
      if (emp.uid) employeeMap[emp.uid] = emp;
      if (emp.name) employeeMap[emp.name] = emp;
      if (emp.employeeName) employeeMap[emp.employeeName] = emp;
      if (emp.email) employeeMap[emp.email.toLowerCase()] = emp;
    });

    users.forEach((u) => {
      const name = u.name || u.employeeName || u.displayName || u.email;
      const empObj = {
        _id: u._id,
        name: name,
        employeeName: name,
        email: u.email,
        uid: u.uid || u._id,
      };
      if (u._id) employeeMap[u._id.toString()] = empObj;
      if (u.id) employeeMap[u.id.toString()] = empObj;
      if (u.uid) employeeMap[u.uid] = empObj;
      if (u.name) employeeMap[u.name] = empObj;
      if (u.email) employeeMap[u.email.toLowerCase()] = empObj;
    });

    const populatedTasks = tasks.map((task) => {
      if (task.assignedTo) {
        if (typeof task.assignedTo === "object") {
          return task;
        }
        const lookupKey = String(task.assignedTo).toLowerCase();
        const found = employeeMap[task.assignedTo] || employeeMap[lookupKey];
        if (found) {
          return {
            ...task,
            assignedTo: {
              _id: found._id,
              name: found.employeeName || found.name || found.email,
              employeeName: found.employeeName || found.name,
              email: found.email,
            },
          };
        }
      }
      return task;
    });

    res.json(populatedTasks);
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/recent/:employee_uid", async (req, res) => {
  try {
    const recentTasks = await Task.find({
      assignedTo: req.params.employee_uid,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: recentTasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get Task by ID
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    res.json(task);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Update Task
router.put("/:id", async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    // Broadcast Socket Event for Real-time Sync
    const io = getIO();
    if (io) {
      io.emit("taskUpdated", updatedTask);
    }

    res.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({
      message: error.message,
    });
  }
});

// Delete Task
router.delete("/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);

    const io = getIO();
    if (io) {
      io.emit("taskUpdated", { deletedId: req.params.id });
    }

    res.status(200).json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;