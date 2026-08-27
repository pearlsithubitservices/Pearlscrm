const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

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
    const { name, email, password, role, industry } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const safeRole = role === "Admin" || role === "Employee" ? role : "Employee";

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
    const salary = {
      basicSalary: Number(basicSalary) || 0,
      grossSalary: Number(grossSalary) || 0,
      netSalary: Number(netSalary) || 0,
      allowances: allowances || {},
      deductions: deductions || {},
    };
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { "profile.salary": salary } },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ success: false, message: "Employee not found" });
    return res.status(200).json({ success: true, message: "Salary updated successfully", user });
  } catch (error) {
    console.error("Update employee salary error:", error);
    return res.status(500).json({ success: false, message: "Unable to update salary" });
  }
};

module.exports = {
  register,
  login,
  getMe,
  getAllUsers,
  updateUserSalary,
  toggleUserStatus,
};