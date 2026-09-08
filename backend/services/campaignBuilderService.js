const Lead = require("../models/Leads");
const Followup = require("../models/Followup");
const Employee = require("../models/Employee");

const RATE_LIMIT_MS = Number(process.env.WHATSAPP_RATE_LIMIT_MS) || 40;
const MESSAGES_PER_MINUTE = Math.floor(60000 / RATE_LIMIT_MS);
const ORG_NAME = process.env.ORG_NAME || "Pearls IT Hub";

const BASE_MESSAGE_TAGS = [
  { tag: "{{name}}", label: "Lead Name", field: "name" },
  { tag: "{{company}}", label: "Company", field: "company" },
  { tag: "{{phone}}", label: "Phone", field: "phone" },
  { tag: "{{email}}", label: "Email", field: "email" },
  { tag: "{{status}}", label: "Status", field: "status" },
  { tag: "{{source}}", label: "Source", field: "source" },
  { tag: "{{priority}}", label: "Priority", field: "priority" },
  { tag: "{{Hospital}}", label: "Organization", field: "_org" },
];

const extractTagsFromText = (text = "") => {
  const matches = text.match(/\{\{[^}]+\}\}/g) || [];
  return [...new Set(matches)];
};

const buildLeadVariables = (lead) => ({
  name: lead.name || "Customer",
  company: lead.company || "",
  phone: lead.phone || "",
  email: lead.email || "",
  status: lead.status || "",
  source: lead.source || "",
  priority: lead.priority || "",
  Hospital: ORG_NAME,
  "Patient Name": lead.name || "Customer",
  Doctor: lead.assignedEmployee || lead.assignedTo || "Team",
  "Appointment Date": lead.nextAction || "TBD",
  Token: `#${String(lead._id).slice(-6).toUpperCase()}`,
});

const buildAudienceQuery = async (filters = {}) => {
  const query = { phone: { $exists: true, $ne: "" } };

  if (filters.status?.length) query.status = { $in: filters.status };
  if (filters.source?.length) query.source = { $in: filters.source };
  if (filters.priority?.length) query.priority = { $in: filters.priority };
  if (filters.assignedTo?.length) query.assignedTo = { $in: filters.assignedTo };

  if (filters.lastContactOlderThanDays) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - Number(filters.lastContactOlderThanDays));
    query.updatedAt = { $lte: cutoff };
  }

  let leads = await Lead.find(query).select(
    "name company phone email status source priority assignedTo assignedEmployee nextAction followUpCount updatedAt _id"
  );

  if (filters.followUpDue) {
    const pendingFollowups = await Followup.find({
      status: { $in: ["New", "Pending"] },
    }).select("phone");
    const duePhones = new Set(pendingFollowups.map((f) => f.phone).filter(Boolean));
    leads = leads.filter((l) => duePhones.has(l.phone) || (l.followUpCount && l.followUpCount > 0));
  }

  return leads.filter((l) => l.phone);
};

const buildAudience = async (filters = {}) => {
  const leads = await buildAudienceQuery(filters);
  return leads.map((l) => ({
    name: l.name || "Customer",
    phone: l.phone,
    leadId: l._id.toString(),
    variables: buildLeadVariables(l),
  }));
};

const getBuilderConfig = async () => {
  const phoneQuery = { phone: { $exists: true, $ne: "" } };

  const [statuses, sources, priorities, assigneeIds, totalWithPhone, employees] = await Promise.all([
    Lead.distinct("status", phoneQuery),
    Lead.distinct("source", phoneQuery),
    Lead.distinct("priority", phoneQuery),
    Lead.distinct("assignedTo", { ...phoneQuery, assignedTo: { $ne: "" } }),
    Lead.countDocuments(phoneQuery),
    Employee.find().select("employeeName email").lean(),
  ]);

  const employeeNameMap = employees.reduce((map, emp) => {
    map[emp.email] = emp.employeeName;
    return map;
  }, {});

  const assignees = assigneeIds
    .filter(Boolean)
    .map((id) => ({
      id,
      name: employeeNameMap[id] || id,
    }));

  return {
    filters: {
      statuses: statuses.filter(Boolean).sort(),
      sources: sources.filter(Boolean).sort(),
      priorities: priorities.filter(Boolean).sort(),
      assignees,
      totalWithPhone,
    },
    messageTags: BASE_MESSAGE_TAGS.map((t) => ({
      tag: t.tag,
      label: t.label,
    })),
    sending: {
      messagesPerMinute: MESSAGES_PER_MINUTE,
      rateLimitMs: RATE_LIMIT_MS,
      priorities: [
        { id: "low", label: "Low Priority" },
        { id: "normal", label: "Normal Priority" },
        { id: "high", label: "High Priority" },
      ],
      deliveryModes: [
        { id: "send_now", label: "Send Now" },
        { id: "schedule", label: "Schedule" },
        { id: "recurring", label: "Recurring" },
        { id: "delay_failed", label: "Delay Failed" },
      ],
      recurringFrequencies: [
        { id: "daily", label: "Daily" },
        { id: "weekly", label: "Weekly" },
        { id: "monthly", label: "Monthly" },
      ],
    },
    organizationName: ORG_NAME,
  };
};

const resolveMessageBody = (template, variables = {}) => {
  let body = template || "";
  const expanded = { ...variables, _org: ORG_NAME, Hospital: ORG_NAME };

  Object.entries(expanded).forEach(([key, value]) => {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    body = body.replace(new RegExp(`\\{\\{\\s*${escaped}\\s*\\}\\}`, "gi"), value ?? "");
  });

  return body;
};

module.exports = {
  buildAudience,
  buildAudienceQuery,
  buildLeadVariables,
  getBuilderConfig,
  resolveMessageBody,
  extractTagsFromText,
  MESSAGES_PER_MINUTE,
};
