const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Employee = require("../models/Employee");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const register = async (req, res) => {
  try {
    const { name, email, password, role, industry, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (role === "Admin") {
      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot be created through registration",
      });
    }

    const safeRole = "Employee";
    const safeDepartment = String(department || "Engineering").trim() || "Engineering";

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: safeRole,
      industry: industry || "IT",
      department: safeDepartment,
      profile: {
        department: safeDepartment,
      },
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        industry: user.industry,
        department: user.department || user.profile?.department || "Engineering",
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.status === "Suspended") {
      return res.status(403).json({
        success: false,
        message: "This employee account is suspended",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        industry: user.industry,
        department: user.department || user.profile?.department || "Engineering",
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        industry: user.industry,
        department: user.department || user.profile?.department || "Engineering",
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Get me error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "Employee not found" });
    if (user.role === "Admin") return res.status(400).json({ success: false, message: "Admin accounts cannot be suspended" });
    user.status = user.status === "Suspended" ? "Active" : "Suspended";
    await user.save();
    return res.status(200).json({ success: true, status: user.status, message: `Employee ${user.status.toLowerCase()}` });
  } catch (error) {
    console.error("Toggle employee status error:", error);
    return res.status(500).json({ success: false, message: "Unable to update employee status" });
  }
};

const updateUserSalary = async (req, res) => {
  try {
    const { basicSalary, grossSalary, netSalary, allowances, deductions } = req.body;

    const parseFlexible = (value, defaultKey = "Allowance") => {
      if (!value && value !== 0) return {};
      if (typeof value === "number") return value > 0 ? { [defaultKey]: value } : {};
      if (typeof value === "object" && !Array.isArray(value)) {
        const out = {};
        Object.entries(value).forEach(([k, v]) => {
          if (k && String(k).trim()) {
            const num = Number(String(v).replace(/[^0-9.]/g, "")) || 0;
            if (num > 0) out[String(k).trim()] = num;
          }
        });
        return out;
      }
      const str = String(value).trim();
      if (!str || str === "{}" || str === "[]") return {};

      // If JSON string
      if (str.startsWith("{") || str.startsWith("[")) {
        try {
          return parseFlexible(JSON.parse(str), defaultKey);
        } catch (_) {}
      }

      // If pure number or currency e.g. "50,000" or "50000"
      const cleanNum = str.replace(/[^0-9.]/g, "");
      if (cleanNum && !str.includes(":") && !str.includes("=") && !str.includes("-")) {
        const n = Number(cleanNum) || 0;
        return n > 0 ? { [defaultKey]: n } : {};
      }

      const out = {};
      const items = str.split(/;|\n|,\s*(?=[A-Za-z])/);
      items.forEach((item) => {
        const trimmed = item.trim();
        if (!trimmed) return;
        const match = trimmed.match(/^([^:=0-9]+)\s*[:=\-]?\s*([₹$\s]*[0-9,]+(\.[0-9]+)?.*)$/);
        if (match) {
          const k = match[1].trim();
          const v = Number(match[2].replace(/[^0-9.]/g, "")) || 0;
          if (k && v > 0) out[k] = v;
        } else {
          const n = Number(trimmed.replace(/[^0-9.]/g, "")) || 0;
          if (n > 0) out[defaultKey] = n;
        }
      });
      return Object.keys(out).length > 0 ? out : (Number(cleanNum) > 0 ? { [defaultKey]: Number(cleanNum) } : {});
    };

    const cleanAllowances = parseFlexible(allowances, "Allowance");
    const cleanDeductions = parseFlexible(deductions, "Deduction");

    const totalAllowances = Object.values(cleanAllowances).reduce((sum, val) => sum + (Number(val) || 0), 0);
    const totalDeductions = Object.values(cleanDeductions).reduce((sum, val) => sum + (Number(val) || 0), 0);

    const numBasic = Number(String(basicSalary || 0).replace(/[^0-9.]/g, "")) || 0;
    const numGrossProvided = Number(String(grossSalary || 0).replace(/[^0-9.]/g, "")) || 0;
    const numNetProvided = Number(String(netSalary || 0).replace(/[^0-9.]/g, "")) || 0;

    const numGross = numGrossProvided > 0 ? numGrossProvided : (numBasic + totalAllowances);
    const numNet = numNetProvided > 0 ? numNetProvided : Math.max(0, numGross - totalDeductions);

    const salary = {
      basicSalary: numBasic,
      grossSalary: numGross,
      netSalary: numNet,
      allowances: cleanAllowances,
      deductions: cleanDeductions,
    };

    const mongoose = require("mongoose");
    const targetId = req.params.id;
    let user = null;
    let employeeDoc = null;

    if (mongoose.Types.ObjectId.isValid(targetId)) {
      user = await User.findByIdAndUpdate(
        targetId,
        { $set: { "profile.salary": salary, salary } },
        { new: true }
      ).select("-password");

      employeeDoc = await Employee.findByIdAndUpdate(
        targetId,
        { $set: { "profile.salary": salary, salary } },
        { new: true }
      );
    }

    if (!user && !employeeDoc) {
      const query = {
        $or: [
          { email: String(targetId).toLowerCase() },
          { empId: targetId },
          { "profile.empId": targetId },
        ],
      };

      user = await User.findOneAndUpdate(
        query,
        { $set: { "profile.salary": salary, salary } },
        { new: true }
      ).select("-password");

      employeeDoc = await Employee.findOneAndUpdate(
        query,
        { $set: { "profile.salary": salary, salary } },
        { new: true }
      );
    }

    // If ID was in Employee but User exists with same email, sync User too
    if (!user && employeeDoc?.email) {
      user = await User.findOneAndUpdate(
        { email: employeeDoc.email.toLowerCase() },
        { $set: { "profile.salary": salary, salary } },
        { new: true }
      ).select("-password");
    } else if (user?.email && !employeeDoc) {
      employeeDoc = await Employee.findOneAndUpdate(
        { email: user.email.toLowerCase() },
        { $set: { "profile.salary": salary, salary } },
        { new: true }
      );
    }

    if (!user && !employeeDoc) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Salary updated successfully",
      salary,
      user: user || employeeDoc,
    });
  } catch (error) {
    console.error("Update employee salary error:", error);
    return res.status(500).json({ success: false, message: "Unable to update salary: " + error.message });
  }
};

const updateUserDescription = async (req, res) => {
  try {
    const description = String(req.body.description || "").trim();
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { "profile.description": description } },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ success: false, message: "Employee not found" });
    return res.status(200).json({ success: true, message: "Description updated successfully", user });
  } catch (error) {
    console.error("Update employee description error:", error);
    return res.status(500).json({ success: false, message: "Unable to update description" });
  }
};

module.exports = {
  register,
  login,
  getMe,
  getAllUsers,
  updateUserSalary,
  updateUserDescription,
  toggleUserStatus,
};