const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./db");

const leadRoutes = require("./routes/leadRoutes");
const taskRoutes = require("./routes/TaskRoutes");
const followupRoutes = require("./routes/followupRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const attendanceRoutes =
require("./routes/attendanceRoutes");
connectDB();

const app = express();
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://pearlscrm.vercel.app'
    ],
    methods: [
      'GET',
      'POST',
      'PUT',
      'DELETE'
    ],
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/leads", leadRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/followups", followupRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use(
  "/api/attendance",
  attendanceRoutes
);
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});