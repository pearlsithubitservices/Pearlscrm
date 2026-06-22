const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./db");
const MarketingLeadRoutes =require("./routes/marketingLeadRoutes");
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
const ReimbursementRoutes = require('./routes/ReimbursementRoutes');

const EmpAttendanceRoutes = require('./routes/EmpAttendanceRoutes');
const AnnouncementSchema = require('./routes/Announcements');
const NotificationRoutes = require('./routes/NotificationRoutes');
const TicketRoutes = require('./routes/TicketRoutes');
const path = require("path");
const FeedbackRoutes = require('./routes/FeedbackRoutes');
const PayslipRoutes = require('./routes/PayslipRoutes');
const EmpAttendanceCorrectionRoutes = require('./routes/EmpAttendanceCorrectionRoutes');
const EmpMyGoal = require('./routes/MyGoalRoutes');
const EmpReview = require('./routes/ReviewRoutes');
const EmpEnrollment = require('./routes/EnrollmentRoutes');
const EmpCourse = require('./routes/EmpCourseRoutes');
const EmpSkillCertification = require('./routes/SkillCertificationRoutes');
const EmpContributionRoutes = require("./routes/ContributionRoutes");
const EmpActivityRoutes= require("./routes/TaskActivityRoute")
const EmpTotalLeave=require('./routes/TotalLeaveRoutes');




connectDB();

const app = express();
console.log("EmployeeRoutes =", EmployeeRoutes);
console.log("PaymentRoutes =", PaymentRoutes);
console.log("MarketingLeadRoutes =", MarketingLeadRoutes);
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
      'DELETE',
      'PATCH',
    ],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());


app.use("/api/leads", leadRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/followups", followupRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/projects", ProjectsRoutes);
app.use("/api/clients", ClientRoutes);
app.use("/api/employees", EmployeeRoutes);
app.use("/api/payment", PaymentRoutes);
app.use("/api/marketing-leads",MarketingLeadRoutes);
app.use("/api/leave", LeaveRoute);
app.use("/api/holidays", HolidayRoute);
app.use("/api/reimbursement", ReimbursementRoutes);

app.use("/api/empattendancenew", EmpAttendanceRoutes)
app.use("/api/announcement", AnnouncementSchema);
app.use("/api/notification", NotificationRoutes);
app.use("/api/ticket", TicketRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/feedback", FeedbackRoutes);
app.use("/api/payslip", PayslipRoutes);
app.use("/api/empAttendanceCorrection", EmpAttendanceCorrectionRoutes);
app.use("/api/mygoal", EmpMyGoal)
app.use("/api/review", EmpReview);
app.use("/api/empenrollment", EmpEnrollment);
app.use("/api/empCourse", EmpCourse);
app.use("/api/skillscertification", EmpSkillCertification);
app.use("/api/contribution", EmpContributionRoutes);
app.use("/api/activity",EmpActivityRoutes);
app.use('/api/totalLeave', EmpTotalLeave);


app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
  console.log("Connected to database");
});


