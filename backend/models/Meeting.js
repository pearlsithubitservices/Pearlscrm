const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    contact: { type: mongoose.Schema.Types.ObjectId, ref: "Client", default: null },
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    role: { type: String, default: "Attendee" },
    responseStatus: {
      type: String,
      enum: ["Pending", "Accepted", "Declined", "Maybe"],
      default: "Pending",
    },
    attendanceStatus: {
      type: String,
      enum: ["Not Responded", "Attended", "Absent"],
      default: "Not Responded",
    },
    joinedAt: { type: Date },
    leftAt: { type: Date },
    isExternal: { type: Boolean, default: false },
  },
  { _id: true }
);

const agendaSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    owner: { type: String, default: "" },
    duration: { type: Number, default: 15 },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Skipped"],
      default: "Pending",
    },
  },
  { _id: true }
);

const attachmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, default: "file" },
    size: { type: Number, default: 0 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const reminderSchema = new mongoose.Schema(
  {
    minutesBefore: { type: Number, default: 15 },
    channel: {
      type: String,
      enum: ["In-app", "Email", "SMS"],
      default: "In-app",
    },
    sent: { type: Boolean, default: false },
    sentAt: { type: Date },
  },
  { _id: true }
);

const decisionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    decidedBy: { type: String, default: "" },
    date: { type: Date, default: Date.now },
  },
  { _id: true }
);

const actionItemSchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", default: null },
    title: { type: String, required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Cancelled"],
      default: "Pending",
    },
  },
  { _id: true }
);

const followUpSchema = new mongoose.Schema(
  {
    required: { type: Boolean, default: false },
    date: { type: Date },
    type: { type: String, default: "General" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    notes: { type: String, default: "" },
  },
  { _id: false }
);

const activityLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    performedBy: { type: String, default: "System" },
    timestamp: { type: Date, default: Date.now },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: true }
);

const meetingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    type: {
      type: String,
      enum: [
        "Team Meeting",
        "Client Meeting",
        "Project Meeting",
        "One-to-One",
        "Review Meeting",
        "Interview",
        "Training",
        "Follow-up",
        "Sales Meeting",
        "Other",
      ],
      default: "Team Meeting",
    },
    priority: {
      type: String,
      enum: ["Low", "Normal", "High", "Urgent"],
      default: "Normal",
    },
    status: {
      type: String,
      enum: ["Scheduled", "In Progress", "Completed", "Cancelled", "Rescheduled", "No Show"],
      default: "Scheduled",
    },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    timezone: { type: String, default: "UTC" },
    isAllDay: { type: Boolean, default: false },
    recurrence: {
      enabled: { type: Boolean, default: false },
      frequency: {
        type: String,
        enum: ["Does not repeat", "Daily", "Weekly", "Monthly", "Custom"],
        default: "Does not repeat",
      },
      interval: { type: Number, default: 1 },
      daysOfWeek: [{ type: Number }],
      endDate: { type: Date },
      occurrences: { type: Number },
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [participantSchema],
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", default: null },
    contact: { type: String, default: "" },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", default: null },
    deal: { type: String, default: "" },
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", default: null },
    followUp: { type: mongoose.Schema.Types.ObjectId, ref: "Followup", default: null },
    location: {
      type: {
        type: String,
        enum: ["Office", "Google Meet", "Zoom", "Microsoft Teams", "Phone Call", "Custom"],
        default: "Office",
      },
      address: { type: String, default: "" },
      meetingUrl: { type: String, default: "" },
      meetingId: { type: String, default: "" },
      password: { type: String, default: "" },
    },
    agenda: [agendaSchema],
    attachments: [attachmentSchema],
    reminders: [reminderSchema],
    notes: { type: String, default: "" },
    decisions: [decisionSchema],
    actionItems: [actionItemSchema],
    followUpDetails: followUpSchema,
    outcome: {
      type: {
        type: String,
        enum: ["Successful", "Partially Completed", "Requires Follow-up", "No Decision", "Rescheduled", "Cancelled"],
        default: "Successful",
      },
      summary: { type: String, default: "" },
      feedback: { type: String, default: "" },
      nextSteps: { type: String, default: "" },
    },
    actualStartTime: { type: Date },
    actualEndTime: { type: Date },
    actualDuration: { type: Number, default: 0 },
    activityLog: [activityLogSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  {
    timestamps: true,
  }
);

meetingSchema.index({ status: 1, date: 1, organizer: 1, project: 1, client: 1 });
meetingSchema.index({ title: "text", description: "text" });

module.exports = mongoose.models.Meeting || mongoose.model("Meeting", meetingSchema);
