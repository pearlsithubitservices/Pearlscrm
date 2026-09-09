require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const MONGO_URI = process.env.MONGO_URI;
const ADMIN_EMAIL = "admin@pearlscrm.com";
const ADMIN_PASSWORD = "admin123";

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });

    if (existingAdmin) {
      console.log(`Admin already exists: ${ADMIN_EMAIL}`);
      await mongoose.disconnect();
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const admin = await User.create({
      name: "Admin",
      email: ADMIN_EMAIL.toLowerCase(),
      password: hashedPassword,
      role: "Admin",
      industry: "IT",
      department: "Administration",
      status: "Active",
    });

    console.log("Admin account created successfully:");
    console.log(`  Email: ${admin.email}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log(`  Role: ${admin.role}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedAdmin();
