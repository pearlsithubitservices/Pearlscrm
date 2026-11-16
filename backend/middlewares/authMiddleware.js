const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Token missing.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

const adminOnly = async (req, res, next) => {
  try {
    if ((req.user?.role || "").toLowerCase() === "admin") {
      return next();
    }

    const User = require("../models/User");
    const user = await User.findById(req.user?.id).select("role department profile.department status");
    const isHrDepartment = [user?.department, user?.profile?.department]
      .filter(Boolean)
      .some((department) =>
        ["hr", "hr department", "human resources", "human resource"].includes(
          String(department).trim().toLowerCase(),
        ),
      );

    if (
      user?.status !== "Suspended" &&
      String(user?.role || "").toLowerCase() === "employee" &&
      isHrDepartment
    ) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Admin or HR department access required",
    });
  } catch (error) {
    console.error("Admin access check failed:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to verify administrator access",
    });
  }
};

module.exports = {
  protect,
  adminOnly,
};