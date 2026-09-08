const express = require("express");
const { register, login, getMe, getAllUsers, updateUserSalary, updateUserDescription, toggleUserStatus } = require("../controllers/authController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/users", getAllUsers);
router.put("/users/:id/salary", protect, adminOnly, updateUserSalary);
router.put("/users/:id/description", protect, adminOnly, updateUserDescription);
router.put("/users/:id/status", protect, adminOnly, toggleUserStatus);

module.exports = router;