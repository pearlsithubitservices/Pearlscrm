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
  require("./routes/AttendanceRoutes");
const ProjectsRoutes = require("./routes/ProjectsRoutes");
const ClientRoutes = require("./routes/ClientRoutes");
const EmployeeRoutes = require('./routes/EmployeeRoutes');
const PaymentRoutes = require('./routes/PaymentRoutes');
const LeaveRoute = require('./routes/LeaveRoute');
const HolidayRoute = require('./routes/HolidayRoute');



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
app.use("/api/projects", ProjectsRoutes);
app.use("/api/clients", ClientRoutes);
app.use("/api/employees", EmployeeRoutes);
app.use("/api/payment", PaymentRoutes);
app.use("/api/leave",LeaveRoute);
app.use("/api/holidays",HolidayRoute);




app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
  console.log("Connected to database");
});


