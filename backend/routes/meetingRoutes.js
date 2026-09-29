const express = require("express");
const router = express.Router();
const Meeting = require("../models/Meeting");
const User = require("../models/User");
const Notification = require("../models/CommunicationModels/Notifications");
const Followup = require("../models/Followup");
const Task = require("../models/TaskModels/Task");
const { protect } = require("../middlewares/authMiddleware");

router.use(protect);

const buildMeetingQuery = (req) => {
  const { status, type, priority, organizer, dateFrom, dateTo, search, mine } = req.query;
  const query = {};

  if (status) query.status = status;
  if (type) query.type = type;
  if (priority) query.priority = priority;
  if (organizer) query.organizer = organizer;

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { type: { $regex: search, $options: "i" } },
      { "participants.name": { $regex: search, $options: "i" } },
      { "participants.email": { $regex: search, $options: "i" } },
    ];
  }

  if (dateFrom || dateTo) {
    query.date = {};
    if (dateFrom) query.date.$gte = new Date(dateFrom);
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      query.date.$lte = endDate;
    }
  }

  if (mine === "true") {
    query.$or = [
      { organizer: req.user.id },
      { "participants.user": req.user.id },
      { "participants.email": req.user.email },
    ];
  }

  return query;
};

const formatDate = (value) => {
  if (!value) return null;

  if (typeof value === "string" && !Number.isNaN(Date.parse(value))) {
    return new Date(value);
  }

  return new Date(value);
};

const addActivity = (meeting, action, performedBy, metadata = {}) => {
  meeting.activityLog = meeting.activityLog || [];
  meeting.activityLog.push({
    action,
    performedBy,
    timestamp: new Date(),
    metadata,
  });
};

const sendMeetingNotification = async (meeting, title, extra = {}, senderId = null) => {
  try {
    const targets = [
      meeting.organizer,
      ...meeting.participants.map((participant) => participant.user || null),
    ].filter(Boolean);

    const notificationPayload = targets.map((targetId) => ({
      title,
      sub: meeting.title,
      notificationType: "Meeting",
      employeeId: String(targetId),
      senderId: String(senderId || meeting.organizer || ""),
      ...extra,
    }));

    if (notificationPayload.length) {
      await Notification.insertMany(notificationPayload);
    }
  } catch (error) {
    console.warn("Meeting notification failed:", error.message);
  }
};

router.get("/calendar", async (req, res) => {
  try {
    const { start, end } = req.query;
    const query = {
      date: {
        $gte: new Date(start || new Date()),
        $lte: new Date(end || new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)),
      },
    };

    if (req.query.mine === "true") {
      query.$or = [
        { organizer: req.user.id },
        { "participants.user": req.user.id },
      ];
    }

    const meetings = await Meeting.find(query)
      .sort({ date: 1, startTime: 1 })
      .populate("organizer", "name email role")
      .lean();

    res.status(200).json({ success: true, data: meetings });
  } catch (error) {
    console.error("Error fetching meeting calendar:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/today", async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const query = { date: { $gte: start, $lte: end } };
    if (req.query.mine === "true") {
      query.$or = [{ organizer: req.user.id }, { "participants.user": req.user.id }];
    }

    const meetings = await Meeting.find(query).sort({ startTime: 1 }).lean();
    res.status(200).json({ success: true, data: meetings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/upcoming", async (req, res) => {
  try {
    const now = new Date();
    const query = { date: { $gte: now }, status: { $ne: "Completed" } };
    if (req.query.mine === "true") {
      query.$or = [{ organizer: req.user.id }, { "participants.user": req.user.id }];
    }

    const meetings = await Meeting.find(query).sort({ date: 1, startTime: 1 }).lean();
    res.status(200).json({ success: true, data: meetings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/my-meetings", async (req, res) => {
  try {
    const meetings = await Meeting.find({
      $or: [
        { organizer: req.user.id },
        { "participants.user": req.user.id },
        { "participants.email": req.user.email },
      ],
    })
      .sort({ date: 1, startTime: 1 })
      .populate("organizer", "name email")
      .lean();

    res.status(200).json({ success: true, data: meetings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/history", async (req, res) => {
  try {
    const meetings = await Meeting.find({
      $or: [
        { organizer: req.user.id },
        { "participants.user": req.user.id },
      ],
    })
      .sort({ updatedAt: -1 })
      .lean();

    res.status(200).json({ success: true, data: meetings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const meetings = await Meeting.find(buildMeetingQuery(req))
      .sort({ date: 1, startTime: 1 })
      .populate("organizer", "name email role")
      .populate("project", "title")
      .populate("client", "companyName")
      .lean();

    res.status(200).json({ success: true, data: meetings });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const payload = req.body || {};

    if (!payload.title || !payload.date || !payload.startTime || !payload.endTime || !payload.type) {
      return res.status(400).json({
        success: false,
        message: "Meeting title, date, start time, end time, and type are required.",
      });
    }

    if (payload.startTime && payload.endTime && payload.startTime >= payload.endTime) {
      return res.status(400).json({
        success: false,
        message: "Meeting end time must be after the start time.",
      });
    }

    const organizer = payload.organizer || req.user.id;
    const userExists = await User.findById(organizer);
    if (!userExists) {
      return res.status(404).json({ success: false, message: "Organizer not found." });
    }

    const meetingPayload = {
      ...payload,
      organizer,
      createdBy: req.user.id,
      updatedBy: req.user.id,
      date: formatDate(payload.date),
      actualStartTime: payload.actualStartTime ? formatDate(payload.actualStartTime) : null,
      actualEndTime: payload.actualEndTime ? formatDate(payload.actualEndTime) : null,
      activityLog: [
        {
          action: "Meeting created",
          performedBy: req.user.id,
          metadata: { title: payload.title },
        },
      ],
    };

    const meeting = await Meeting.create(meetingPayload);
    await sendMeetingNotification(meeting, `Meeting scheduled: ${meeting.title}`, {}, req.user.id);

    res.status(201).json({ success: true, message: "Meeting scheduled successfully", data: meeting });
  } catch (error) {
    console.error("Error creating meeting:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id)
      .populate("organizer", "name email role")
      .populate("project", "title")
      .populate("client", "companyName")
      .populate("participants.user", "name email role")
      .populate("actionItems.assignedTo", "name email")
      .lean();

    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    res.status(200).json({ success: true, data: meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const existing = await Meeting.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    const payload = { ...req.body };
    if (payload.date) payload.date = formatDate(payload.date);
    if (payload.actualStartTime) payload.actualStartTime = formatDate(payload.actualStartTime);
    if (payload.actualEndTime) payload.actualEndTime = formatDate(payload.actualEndTime);
    payload.updatedBy = req.user.id;

    addActivity(existing, "Meeting updated", req.user.id, { updatedFields: Object.keys(payload) });

    const meeting = await Meeting.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });

    await sendMeetingNotification(meeting, `Meeting updated: ${meeting.title}`, {}, req.user.id);
    res.status(200).json({ success: true, message: "Meeting updated successfully", data: meeting });
  } catch (error) {
    console.error("Error updating meeting:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    meeting.status = status;
    addActivity(meeting, `Meeting status changed to ${status}`, req.user.id, { status });
    meeting.updatedBy = req.user.id;
    await meeting.save();

    res.status(200).json({ success: true, data: meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/:id/start", async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    meeting.status = "In Progress";
    meeting.actualStartTime = new Date();
    addActivity(meeting, "Meeting started", req.user.id, { startedAt: meeting.actualStartTime });
    meeting.updatedBy = req.user.id;
    await meeting.save();

    res.status(200).json({ success: true, data: meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/:id/end", async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    meeting.status = "Completed";
    meeting.actualEndTime = new Date();
    if (meeting.actualStartTime) {
      const durationMs = meeting.actualEndTime - meeting.actualStartTime;
      meeting.actualDuration = Math.max(0, Math.round(durationMs / 60000));
    }
    addActivity(meeting, "Meeting completed", req.user.id, { endedAt: meeting.actualEndTime });
    meeting.updatedBy = req.user.id;
    await meeting.save();

    res.status(200).json({ success: true, data: meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/:id/reschedule", async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    const { date, startTime, endTime, reason } = req.body;
    if (!date || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: "New date, start time and end time are required." });
    }

    const previousDate = meeting.date;
    meeting.date = formatDate(date);
    meeting.startTime = startTime;
    meeting.endTime = endTime;
    meeting.status = "Rescheduled";
    addActivity(meeting, "Meeting rescheduled", req.user.id, { previousDate, reason });
    meeting.updatedBy = req.user.id;
    await meeting.save();

    res.status(200).json({ success: true, data: meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/:id/cancel", async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    meeting.status = "Cancelled";
    addActivity(meeting, "Meeting cancelled", req.user.id, { reason: req.body?.reason || "Cancelled" });
    meeting.updatedBy = req.user.id;
    await meeting.save();

    res.status(200).json({ success: true, data: meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/:id/participants", async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    const participant = req.body;
    if (!participant.name && !participant.email) {
      return res.status(400).json({ success: false, message: "Participant name or email is required." });
    }

    if (meeting.participants.some((item) => item.email && item.email.toLowerCase() === String(participant.email || "").toLowerCase())) {
      return res.status(409).json({ success: false, message: "This participant already exists in the meeting." });
    }

    meeting.participants.push({
      ...participant,
      responseStatus: participant.responseStatus || "Pending",
      attendanceStatus: participant.attendanceStatus || "Not Responded",
      isExternal: !participant.user,
    });

    addActivity(meeting, "Participant added", req.user.id, { participant: participant.name || participant.email });
    meeting.updatedBy = req.user.id;
    await meeting.save();

    res.status(201).json({ success: true, data: meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/:id/participants/:participantId", async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    const participant = meeting.participants.id(req.params.participantId);
    if (!participant) {
      return res.status(404).json({ success: false, message: "Participant not found" });
    }

    Object.assign(participant, req.body);
    addActivity(meeting, `Participant response: ${participant.responseStatus || "updated"}`, req.user.id, {
      participantId: req.params.participantId,
    });
    meeting.updatedBy = req.user.id;
    await meeting.save();

    res.status(200).json({ success: true, data: meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/:id/agenda", async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    meeting.agenda.push({ ...req.body, status: req.body.status || "Pending" });
    addActivity(meeting, "Agenda item added", req.user.id, { title: req.body.title });
    meeting.updatedBy = req.user.id;
    await meeting.save();

    res.status(201).json({ success: true, data: meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/:id/notes", async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    meeting.notes = req.body.notes || "";
    addActivity(meeting, "Meeting notes updated", req.user.id, { hasNotes: Boolean(meeting.notes) });
    meeting.updatedBy = req.user.id;
    await meeting.save();

    res.status(200).json({ success: true, data: meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/:id/decisions", async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    meeting.decisions.push({ ...req.body, date: new Date() });
    addActivity(meeting, "Decision added", req.user.id, { title: req.body.title });
    meeting.updatedBy = req.user.id;
    await meeting.save();

    res.status(201).json({ success: true, data: meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/:id/action-items", async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    const createdTask = await Task.create({
      title: req.body.title || "Meeting action item",
      description: req.body.description || "",
      assignedTo: req.body.assignedTo || null,
      priority: req.body.priority || "Medium",
      status: "Pending",
      dueDate: req.body.dueDate || null,
      projectId: meeting.project || "",
    });

    meeting.actionItems.push({
      task: createdTask._id,
      title: createdTask.title,
      assignedTo: req.body.assignedTo || null,
      dueDate: createdTask.dueDate,
      status: "Pending",
    });

    addActivity(meeting, "Action item created", req.user.id, { task: createdTask._id });
    meeting.updatedBy = req.user.id;
    await meeting.save();

    res.status(201).json({ success: true, data: { meeting, task: createdTask } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/:id/follow-up", async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    const followUpRecord = await Followup.create({
      clientName: req.body.clientName || meeting.title,
      companyName: req.body.companyName || "",
      phone: req.body.phone || "",
      email: req.body.email || "",
      assignedTo: req.body.assignedTo || req.user.id,
      status: "Pending",
      date: req.body.date || meeting.date,
      notes: req.body.notes || "",
      nextFollowupDate: req.body.date || meeting.date,
    });

    meeting.followUpDetails = {
      required: true,
      date: req.body.date || meeting.date,
      type: req.body.type || "Follow-up",
      assignedTo: req.body.assignedTo || req.user.id,
      notes: req.body.notes || "",
    };
    meeting.followUp = followUpRecord._id;
    addActivity(meeting, "Follow-up created", req.user.id, { followUpId: followUpRecord._id });
    meeting.updatedBy = req.user.id;
    await meeting.save();

    res.status(201).json({ success: true, data: { meeting, followUp: followUpRecord } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/:id/reminders", async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    const reminder = {
      minutesBefore: Number(req.body.minutesBefore || 15),
      channel: req.body.channel || "In-app",
      sent: false,
    };

    meeting.reminders.push(reminder);
    meeting.updatedBy = req.user.id;
    await meeting.save();

    res.status(201).json({ success: true, data: meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    await Meeting.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Meeting deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
