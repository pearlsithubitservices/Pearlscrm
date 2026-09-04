const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const connectDB = require("./db");

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const leadRoutes = require("./routes/leadRoutes");
const taskRoutes = require("./routes/TaskRoutes");
const followupRoutes = require("./routes/followupRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const attendanceRoutes = require("./routes/AttendanceRoutes");
const ProjectsRoutes = require("./routes/ProjectsRoutes");
const ClientRoutes = require("./routes/ClientRoutes");
const EmployeeRoutes = require("./routes/EmployeeRoutes");
const PaymentRoutes = require("./routes/PaymentRoutes");
const LeaveRoute = require("./routes/LeaveRoute");
const HolidayRoute = require("./routes/HolidayRoute");
const ReimbursementRoutes = require("./routes/ReimbursementRoutes");
const EmpAttendanceRoutes = require("./routes/EmpAttendanceRoutes");
const AnnouncementSchema = require("./routes/Announcements");
const NotificationRoutes = require("./routes/NotificationRoutes");
const TicketRoutes = require("./routes/TicketRoutes");
const FeedbackRoutes = require("./routes/FeedbackRoutes");
const PayslipRoutes = require("./routes/PayslipRoutes");
const EmpAttendanceCorrectionRoutes = require("./routes/EmpAttendanceCorrectionRoutes");
const EmpMyGoal = require("./routes/MyGoalRoutes");
const EmpReview = require("./routes/ReviewRoutes");
const EmpEnrollment = require("./routes/EnrollmentRoutes");
const EmpCourse = require("./routes/EmpCourseRoutes");
const EmpSkillCertification = require("./routes/SkillCertificationRoutes");
const EmpContributionRoutes = require("./routes/ContributionRoutes");
const EmpActivityRoutes = require("./routes/TaskActivityRoute");
const EmpTotalLeave = require('./routes/TotalLeaveRoutes');
const TaskDocumentRoutes = require("./routes/TaskDocumentRoutes");
const BenefitRoutes = require("./routes/BenefitRoutes");

const chatRoutes = require("./routes/ChatRoute");
const messageRoutes = require("./routes/messageRoute");
const { initSocket } = require("./Socket");

const whatsappCampaignRoutes = require('./routes/WhatsAppCampaign/campaignRoutes');
const whatsappTemplateRoutes = require('./routes/WhatsAppCampaign/templateRoutes');
const whatsappBroadcastRoutes = require('./routes/WhatsAppCampaign/broadcastRoutes');
const whatsappQueueRoutes = require('./routes/WhatsAppCampaign/queueRoutes');
const whatsappAnalyticsRoutes = require('./routes/WhatsAppCampaign/analyticsRoutes');
const whatsappConnectionRoutes = require('./routes/WhatsAppCampaign/connectionRoutes');
const whatsappWebhookRoutes = require('./routes/WhatsAppCampaign/webhookRoutes');

const whatsappConversationRoutes = require('./routes/Whatsapp Automation/ConversationRoute');
const automationRuleRoutes = require("./routes/Whatsapp Automation/AutomationRuleRoutes");
const messageTemplateRoutes = require("./routes/Whatsapp Automation/messageTemplates");
const aiConfigRoutes = require("./routes/Whatsapp Automation/aiConfig");
const reportRoutes = require("./routes/Whatsapp Automation/report");
const app = express();
const server = http.createServer(app);
initSocket(server);

app.use(
  cors({
    origin: ["http://localhost:5173", "https://pearlscrm.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/task-documents", TaskDocumentRoutes);
app.use("/api/followups", followupRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/projects", ProjectsRoutes);
app.use("/api/clients", ClientRoutes);
app.use("/api/employees", EmployeeRoutes);
const ReimbursementPolicyroutes = require("./routes/ReimbursementPolicyroutes");
const TaxDocumentsRoutes = require("./routes/TaxDocumentsRoutes");

app.use("/api/payment", PaymentRoutes);
// app.use("/api/marketing-leads",MarketingLeadRoutes);
app.use("/api/leave", LeaveRoute);
app.use("/api/holidays", HolidayRoute);
app.use("/api/reimbursement", ReimbursementRoutes);
app.use("/api/reimbursementpolicy", ReimbursementPolicyroutes);
app.use("/api/taxdocuments", TaxDocumentsRoutes);
app.use("/api/empattendancenew", EmpAttendanceRoutes);
app.use("/api/announcement", AnnouncementSchema);
app.use("/api/notification", NotificationRoutes);
app.use("/api/ticket", TicketRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));


app.use("/api/feedback", FeedbackRoutes);
app.use("/api/payslip", PayslipRoutes);
app.use("/api/benefits", BenefitRoutes);
app.use("/api/empAttendanceCorrection", EmpAttendanceCorrectionRoutes);
app.use("/api/mygoal", EmpMyGoal);
app.use("/api/review", EmpReview);
app.use("/api/empenrollment", EmpEnrollment);
app.use("/api/empCourse", EmpCourse);
app.use("/api/skillscertification", EmpSkillCertification);
app.use("/api/contribution", EmpContributionRoutes);
app.use("/api/activity", EmpActivityRoutes);
app.use('/api/totalLeave', EmpTotalLeave);

app.use("/api/chat", chatRoutes);
app.use("/api/messages", messageRoutes);

const { startFollowupReminderScheduler } = require("./services/followupReminderScheduler");
const { startAttendancePhotoCleanupScheduler } = require("./services/attendancePhotoCleanupScheduler");

app.use('/api/conversations', whatsappConversationRoutes);
app.use("/api/automation-rules", automationRuleRoutes);
app.use("/api/message-templates", messageTemplateRoutes);
app.use("/api/ai-config", aiConfigRoutes);
app.use("/api/reports", reportRoutes);

const PORT = process.env.PORT || 5000;

// Connect to database before starting server
const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log("Connected to database with WebSocket support");
      // Followup reminder scheduler disabled per user request to avoid duplicate notifications
      startAttendancePhotoCleanupScheduler();
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

