const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const mongoose = require("mongoose");
const { protect } = require("../middlewares/authMiddleware");
const User = require("../models/User");
const Employee = require("../models/Employee");
const HRRecord = require("../models/HRRecord");
const PerformanceReview = require("../models/Performance/ReviewModel");

const router = express.Router();
const uploadDir = path.join(__dirname, "../private-uploads/hr-documents");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDir),
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `hr-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const allowedExtensions = new Set([".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"]);
    if (!allowedExtensions.has(path.extname(file.originalname).toLowerCase())) {
      return callback(new Error("Only PDF, Word, and image documents are allowed"));
    }
    callback(null, true);
  },
});

const MODULES = new Set([
  "recruitment",
  "lifecycle",
  "document",
  "probation",
  "grievance",
  "asset",
  "salaryRevision",
]);

const STATUS_OPTIONS = {
  recruitment: ["New", "Screening", "Interview", "Offer", "Hired", "Rejected"],
  lifecycle: ["Not started", "In progress", "Completed", "Cancelled"],
  document: ["Current", "Expiring", "Expired"],
  probation: ["In progress", "Review due", "Confirmed", "Extended", "Unsuccessful"],
  grievance: ["Open", "Under review", "Resolved", "Closed"],
  asset: ["Available", "Assigned", "Under repair", "Returned", "Retired"],
  salaryRevision: ["Pending", "Approved", "Rejected"],
};

const requireHrAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("role department profile.department status");
    const isHrDepartment = [user?.department, user?.profile?.department]
      .filter(Boolean)
      .some((department) =>
        ["hr", "hr department", "human resources", "human resource"].includes(
          String(department).trim().toLowerCase(),
        ),
      );

    if (!user || user.status === "Suspended") {
      return res.status(403).json({ success: false, message: "Active HR administrator access required" });
    }
    if (!["admin", "employee"].includes(String(user.role).toLowerCase()) || !isHrDepartment) {
      return res.status(403).json({ success: false, message: "HR department access required" });
    }
    next();
  } catch (error) {
    console.error("HR access check failed:", error);
    res.status(500).json({ success: false, message: "Unable to verify HR access" });
  }
};

router.use(protect, requireHrAdmin);

const cleanText = (value) => (typeof value === "string" ? value.trim() : "");

const getRecordTitle = (module, details, employeeName) => {
  switch (module) {
    case "recruitment":
      return cleanText(details.candidateName) || "Candidate";
    case "lifecycle":
      return `${cleanText(details.processType)} - ${employeeName}`.trim();
    case "document":
      return `${cleanText(details.category)} - ${employeeName}`.trim();
    case "probation":
      return `${employeeName} probation`.trim();
    case "grievance":
      return `${cleanText(details.category)} grievance - ${employeeName}`.trim();
    case "asset":
      return cleanText(details.assetName) || "Company asset";
    case "salaryRevision":
      return `${employeeName} salary revision`.trim();
    default:
      return employeeName || "HR record";
  }
};

const validateRecord = (module, body, file) => {
  const details = body.details && typeof body.details === "object" ? body.details : {};
  const employeeName = cleanText(body.employeeName || details.employeeName);
  const title = cleanText(body.title);
  const required = {
    recruitment: ["candidateName", "jobTitle"],
    lifecycle: ["employeeName", "processType", "dueDate"],
    document: ["employeeName", "category"],
    probation: ["employeeName", "startDate", "endDate"],
    grievance: ["employeeName", "category", "description"],
    asset: ["assetName", "assetTag", "category"],
    salaryRevision: ["employeeName", "proposedBasicSalary", "effectiveDate"],
  }[module];

  if (!required) return { error: "Unknown HR module" };
  for (const field of required) {
    if (field === "employeeName" && employeeName) continue;
    if (field === "file" && file) continue;
    const value = details[field] ?? body[field];
    if (value === undefined || value === null || String(value).trim() === "") {
      return { error: `${field.replace(/([A-Z])/g, " $1")} is required` };
    }
  }

  if (module === "document" && !file && !details.fileUrl) {
    return { error: "Please attach an employee document" };
  }
  if (module === "salaryRevision") {
    const proposed = Number(details.proposedBasicSalary);
    if (!Number.isFinite(proposed) || proposed <= 0) {
      return { error: "Proposed basic salary must be a positive number" };
    }
    if (cleanText(body.status) && cleanText(body.status) !== "Pending") {
      return { error: "Salary revisions must be created as pending for approval" };
    }
    for (const field of ["proposedGrossSalary", "proposedNetSalary"]) {
      if (details[field] !== undefined && details[field] !== "" && (!Number.isFinite(Number(details[field])) || Number(details[field]) < 0)) {
        return { error: `${field.replace(/([A-Z])/g, " $1")} must be zero or greater` };
      }
    }
  }
  const dateFields = {
    lifecycle: ["dueDate"],
    document: ["expiryDate"],
    probation: ["startDate", "endDate"],
    asset: ["assignedDate"],
    salaryRevision: ["effectiveDate"],
  }[module] || [];
  for (const field of dateFields) {
    if (details[field] && Number.isNaN(Date.parse(details[field]))) {
      return { error: `${field.replace(/([A-Z])/g, " $1")} must be a valid date` };
    }
  }
  if (
    module === "probation" &&
    details.startDate &&
    details.endDate &&
    new Date(details.endDate) < new Date(details.startDate)
  ) {
    return { error: "Probation end date must be on or after the start date" };
  }
  if (
    module === "salaryRevision" &&
    details.proposedGrossSalary !== undefined &&
    details.proposedGrossSalary !== "" &&
    Number(details.proposedGrossSalary) < Number(details.proposedBasicSalary)
  ) {
    return { error: "Proposed gross salary must be at least the proposed basic salary" };
  }
  if (
    module === "salaryRevision" &&
    details.proposedNetSalary !== undefined &&
    details.proposedNetSalary !== "" &&
    details.proposedGrossSalary !== undefined &&
    details.proposedGrossSalary !== "" &&
    Number(details.proposedNetSalary) > Number(details.proposedGrossSalary)
  ) {
    return { error: "Proposed net salary cannot exceed the proposed gross salary" };
  }
  if (
    module === "recruitment" &&
    details.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)
  ) {
    return { error: "Candidate email is invalid" };
  }

  const allowedStatuses = STATUS_OPTIONS[module];
  const status = cleanText(body.status) || allowedStatuses[0];
  if (!allowedStatuses.includes(status)) return { error: "Invalid status for this HR module" };
  if (module === "asset" && status === "Assigned" && !cleanText(details.assignedEmployee)) {
    return { error: "Assign an employee before marking an asset as assigned" };
  }
  if (status !== allowedStatuses[0]) {
    return { error: `New ${module} records must start as "${allowedStatuses[0]}"` };
  }

  const resolvedTitle = title || getRecordTitle(module, details, employeeName);

  return {
    value: {
      module,
      employeeId: cleanText(body.employeeId || details.employeeId),
      employeeName,
      title: resolvedTitle,
      status,
      details: { ...details, ...(employeeName ? { employeeName } : {}) },
    },
  };
};

const applySalaryRevision = async (record) => {
  const details = record.details || {};
  const employeeId = record.employeeId || details.employeeId;
  const employeeEmail = cleanText(details.employeeEmail).toLowerCase();
  const lookup = [];

  if (employeeId) {
    if (mongoose.Types.ObjectId.isValid(employeeId)) lookup.push({ _id: employeeId });
    lookup.push({ empId: employeeId }, { "profile.empId": employeeId });
  }
  if (employeeEmail) lookup.push({ email: employeeEmail });

  if (!lookup.length) throw new Error("A valid employee ID or email is required to apply the salary revision");

  const user = await User.findOne({ $or: lookup });
  const employee = await Employee.findOne({ $or: lookup });
  if (!user && !employee) throw new Error("Employee record was not found for this salary revision");

  const currentSalary = {
    ...(employee?.salary || {}),
    ...(user?.profile?.salary || {}),
    ...(user?.salary || {}),
  };
  const basicSalary = Number(details.proposedBasicSalary);
  const totalAllowances = Object.values(currentSalary.allowances || {})
    .reduce((total, amount) => total + (Number(amount) || 0), 0);
  const totalDeductions = Object.values(currentSalary.deductions || {})
    .reduce((total, amount) => total + (Number(amount) || 0), 0);
  const grossSalary = details.proposedGrossSalary
    ? Number(details.proposedGrossSalary)
    : basicSalary + totalAllowances;
  const netSalary = details.proposedNetSalary
    ? Number(details.proposedNetSalary)
    : Math.max(0, grossSalary - totalDeductions);
  const salary = {
    ...currentSalary,
    basicSalary,
    grossSalary,
    netSalary,
  };

  if (user) {
    user.salary = salary;
    user.profile = { ...(user.profile?.toObject?.() || user.profile || {}), salary };
    await user.save();
  }
  if (employee) {
    employee.salary = salary;
    employee.profile = { ...(employee.profile || {}), salary };
    await employee.save();
  }
};

const hireCandidate = async (record) => {
  const details = record.details || {};
  const email = cleanText(details.email).toLowerCase();
  const contact = cleanText(details.phone);
  const department = cleanText(details.department);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !contact || !department) {
    throw new Error("A valid candidate email, phone, and department are required before hiring");
  }

  let employee = await Employee.findOne({ email });
  if (!employee) {
    const employeeCount = await Employee.countDocuments();
    employee = await Employee.create({
      employeeName: cleanText(details.candidateName),
      employeeRole: cleanText(details.jobTitle) || "Employee",
      empId: `EMP-${1001 + employeeCount}`,
      department,
      status: "Active",
      contact,
      email,
      joinDate: new Date(),
      notes: `Hired through HR recruitment record ${record._id}`,
    });
  }
  record.employeeId = employee.empId || String(employee._id);
  record.employeeName = employee.employeeName;
  record.details = {
    ...details,
    employeeId: record.employeeId,
    employeeEmail: employee.email,
  };
};

const completeOffboarding = async (record) => {
  const details = record.details || {};
  const employeeId = record.employeeId || details.employeeId;
  const email = cleanText(details.employeeEmail).toLowerCase();
  const lookup = [];
  if (employeeId) {
    if (mongoose.Types.ObjectId.isValid(employeeId)) lookup.push({ _id: employeeId });
    lookup.push({ empId: employeeId }, { "profile.empId": employeeId });
  }
  if (email) lookup.push({ email });
  if (!lookup.length) throw new Error("An employee account must be linked before completing offboarding");

  const [user, employee] = await Promise.all([
    User.findOne({ $or: lookup }),
    Employee.findOne({ $or: lookup }),
  ]);
  if (!user && !employee) throw new Error("The employee record was not found");
  if (user && String(user.role).toLowerCase() === "admin") {
    throw new Error("Admin accounts cannot be offboarded through this workflow");
  }
  if (user) {
    user.status = "Suspended";
    await user.save();
  }
  if (employee) {
    employee.status = "Suspended";
    await employee.save();
  }
};

router.get("/records", async (req, res) => {
  try {
    const module = cleanText(req.query.module);
    if (module && !MODULES.has(module)) {
      return res.status(400).json({ success: false, message: "Unknown HR module" });
    }
    const query = module ? { module } : {};
    const records = await HRRecord.find(query).sort({ updatedAt: -1 }).lean();
    res.json({ success: true, data: records });
  } catch (error) {
    console.error("HR records fetch failed:", error);
    res.status(500).json({ success: false, message: "Unable to fetch HR records" });
  }
});

router.get("/employees", async (_req, res) => {
  try {
    const [users, employees] = await Promise.all([
      User.find({ role: "Employee" }).select("name email department profile status salary").lean(),
      Employee.find().select("employeeName email empId department status salary profile").lean(),
    ]);
    const byEmail = new Map();
    for (const employee of employees) {
      byEmail.set(String(employee.email || "").toLowerCase(), {
        id: String(employee._id),
        employeeId: employee.empId || String(employee._id),
        employeeName: employee.employeeName,
        email: employee.email || "",
        department: employee.department || employee.profile?.department || "",
        status: employee.status || "Active",
        salary: employee.salary || employee.profile?.salary || {},
      });
    }
    for (const user of users) {
      const email = String(user.email || "").toLowerCase();
      byEmail.set(email, {
        ...byEmail.get(email),
        id: String(user._id),
        employeeId: user.profile?.empId || String(user._id),
        employeeName: user.name,
        email: user.email || "",
        department: user.department || user.profile?.department || "",
        status: user.status || "Active",
        salary: user.salary || user.profile?.salary || {},
      });
    }
    res.json({ success: true, data: [...byEmail.values()].filter((employee) => employee.email) });
  } catch (error) {
    console.error("HR employee list fetch failed:", error);
    res.status(500).json({ success: false, message: "Unable to fetch employees for HR workflows" });
  }
});

router.get("/analytics", async (_req, res) => {
  try {
    const [users, employeeRecords, records] = await Promise.all([
      User.find({ status: { $ne: "Suspended" }, role: "Employee" }).select("email").lean(),
      Employee.find({ status: { $ne: "Suspended" } }).select("email").lean(),
      HRRecord.find().select("module status details").lean(),
    ]);
    const headcount = new Set(
      [...users, ...employeeRecords].map((employee) => String(employee.email || "").toLowerCase()).filter(Boolean),
    ).size;
    const countBy = (module) => records.filter((record) => record.module === module);
    const probation = countBy("probation");
    const grievances = countBy("grievance");
    const salaryRevisions = countBy("salaryRevision");
    const recruitment = countBy("recruitment");

    res.json({
      success: true,
      data: {
        headcount,
        openPositions: recruitment.filter((record) => !["Hired", "Rejected"].includes(record.status)).length,
        probationDue: probation.filter((record) =>
          ["Review due", "In progress"].includes(record.status) &&
          record.details?.endDate &&
          Date.parse(record.details.endDate) <= Date.now() + 30 * 24 * 60 * 60 * 1000
        ).length,
        openGrievances: grievances.filter((record) => !["Resolved", "Closed"].includes(record.status)).length,
        pendingSalaryRevisions: salaryRevisions.filter((record) => record.status === "Pending").length,
        assignedAssets: countBy("asset").filter((record) => record.status === "Assigned").length,
        documentExpiry: countBy("document").filter((record) => ["Expiring", "Expired"].includes(record.status)).length,
      },
    });
  } catch (error) {
    console.error("HR analytics fetch failed:", error);
    res.status(500).json({ success: false, message: "Unable to fetch HR analytics" });
  }
});

router.get("/performance/:employeeId", async (req, res) => {
  try {
    const employeeId = cleanText(req.params.employeeId);
    const employee = await User.findOne({
      $or: [
        ...(mongoose.Types.ObjectId.isValid(employeeId) ? [{ _id: employeeId }] : []),
        { "profile.empId": employeeId },
        { email: employeeId.toLowerCase() },
      ],
    }).select("email profile.empId");
    const employeeRecord = employee || await Employee.findOne({
      $or: [
        ...(mongoose.Types.ObjectId.isValid(employeeId) ? [{ _id: employeeId }] : []),
        { empId: employeeId },
        { email: employeeId.toLowerCase() },
      ],
    }).select("email empId");
    const identifiers = [...new Set([
      employeeId,
      employee?.id,
      employee?._id?.toString(),
      employee?.profile?.empId,
      employee?.email,
      employeeRecord?.empId,
      employeeRecord?.email,
    ].filter(Boolean).map(String))];
    const reviews = await PerformanceReview.find({ employee_uid: { $in: identifiers } })
      .select("overallRating reviewDate reviewTitle")
      .sort({ reviewDate: -1 })
      .lean();
    const averageRating = reviews.length
      ? reviews.reduce((total, review) => total + Number(review.overallRating || 0), 0) / reviews.length
      : null;
    res.json({ success: true, data: { averageRating, reviewCount: reviews.length, reviews } });
  } catch (error) {
    console.error("HR performance lookup failed:", error);
    res.status(500).json({ success: false, message: "Unable to fetch KPI performance" });
  }
});

const handleUpload = (req, res, next) => {
  upload.single("file")(req, res, (error) => {
    if (error) {
      const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
      return res.status(status).json({ success: false, message: error.message || "Unable to upload employee document" });
    }
    next();
  });
};

router.post("/records", handleUpload, async (req, res) => {
  try {
    const module = cleanText(req.body.module);
    if (!MODULES.has(module)) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ success: false, message: "Unknown HR module" });
    }
    if (req.file && module !== "document") {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ success: false, message: "Files can only be attached to employee document records" });
    }
    let details = {};
    try {
      details =
        typeof req.body.details === "string"
          ? JSON.parse(req.body.details)
          : req.body.details || {};
    } catch {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ success: false, message: "HR record details must be valid JSON" });
    }
    req.body.details = details;
    const validation = validateRecord(module, req.body, req.file);
    if (validation.error) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ success: false, message: validation.error });
    }
    if (module === "salaryRevision" && !validation.value.employeeId && !details.employeeEmail) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ success: false, message: "Select an employee account before requesting a salary revision" });
    }
    if (
      module === "asset" &&
      await HRRecord.exists({ module: "asset", "details.assetTag": cleanText(details.assetTag) })
    ) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(409).json({ success: false, message: "An asset with this tag already exists" });
    }
    if (req.file) {
      validation.value.details.fileName = req.file.originalname;
      validation.value.details.fileSize = req.file.size;
    }
    const record = await HRRecord.create({
      ...validation.value,
      filePath: req.file?.filename || "",
      createdBy: req.user.id,
      updatedBy: req.user.id,
    });
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    if (req.file) fs.unlink(req.file.path, () => {});
    console.error("HR record creation failed:", error);
    res.status(500).json({ success: false, message: "Unable to create HR record" });
  }
});

router.put("/records/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid HR record ID" });
    }
    const record = await HRRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "HR record not found" });

    const requestedStatus = cleanText(req.body.status);
    if (record.module === "salaryRevision" && requestedStatus && req.body.details) {
      return res.status(400).json({ success: false, message: "Update salary revision details and its approval status separately" });
    }
    if (requestedStatus) {
      if (!STATUS_OPTIONS[record.module].includes(requestedStatus)) {
        return res.status(400).json({ success: false, message: "Invalid status for this HR module" });
      }
      if (record.module === "recruitment" && record.status === "Hired" && requestedStatus !== "Hired") {
        return res.status(409).json({ success: false, message: "A hired candidate cannot be moved back in the recruitment pipeline" });
      }
      if (
        record.module === "lifecycle" &&
        String(record.details?.processType).toLowerCase() === "offboarding" &&
        record.status === "Completed" &&
        requestedStatus !== "Completed"
      ) {
        return res.status(409).json({ success: false, message: "Completed offboarding cannot be reopened after account suspension" });
      }
      if (record.module === "salaryRevision" && record.status === "Approved" && requestedStatus !== "Approved") {
        return res.status(409).json({ success: false, message: "An applied salary revision cannot be moved back to another status" });
      }
      if (record.module === "salaryRevision" && record.status !== "Approved" && requestedStatus === "Approved") {
        if (record.details?.effectiveDate && new Date(record.details.effectiveDate) > new Date()) {
          return res.status(409).json({ success: false, message: "A salary revision cannot be applied before its effective date" });
        }
        await applySalaryRevision(record);
      }
      if (record.module === "recruitment" && record.status !== "Hired" && requestedStatus === "Hired") {
        await hireCandidate(record);
      }
      if (
        record.module === "lifecycle" &&
        record.status !== "Completed" &&
        requestedStatus === "Completed" &&
        String(record.details?.processType).toLowerCase() === "offboarding"
      ) {
        await completeOffboarding(record);
      }
      record.status = requestedStatus;
    }
    if (req.body.details && typeof req.body.details === "object") {
      if (record.module === "recruitment" && record.status === "Hired") {
        return res.status(409).json({ success: false, message: "A hired candidate record cannot be edited" });
      }
      if (record.module === "salaryRevision" && record.status === "Approved") {
        return res.status(409).json({ success: false, message: "An applied salary revision cannot be edited" });
      }
      const updatedDetails = { ...(record.details || {}), ...req.body.details };
      if (record.module === "salaryRevision") {
        const validation = validateRecord("salaryRevision", {
          employeeName: record.employeeName,
          employeeId: record.employeeId,
          status: record.status,
          details: updatedDetails,
        });
        if (validation.error) return res.status(400).json({ success: false, message: validation.error });
      }
      if (
        record.module === "asset" &&
        await HRRecord.exists({
          module: "asset",
          "details.assetTag": cleanText(updatedDetails.assetTag),
          _id: { $ne: record._id },
        })
      ) {
        return res.status(409).json({ success: false, message: "An asset with this tag already exists" });
      }
      record.details = updatedDetails;
      record.employeeName = cleanText(record.details.employeeName);
      record.employeeId = cleanText(record.details.employeeId) || record.employeeId;
      record.title = getRecordTitle(record.module, record.details, record.employeeName);
    }
    record.updatedBy = req.user.id;
    await record.save();
    res.json({ success: true, data: record });
  } catch (error) {
    console.error("HR record update failed:", error);
    res.status(500).json({ success: false, message: error.message || "Unable to update HR record" });
  }
});

router.delete("/records/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid HR record ID" });
    }
    const record = await HRRecord.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "HR record not found" });
    if (record.filePath) {
      const filePath = path.resolve(uploadDir, record.filePath);
      if (filePath.startsWith(`${path.resolve(uploadDir)}${path.sep}`) && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    res.json({ success: true, message: "HR record deleted" });
  } catch (error) {
    console.error("HR record deletion failed:", error);
    res.status(500).json({ success: false, message: "Unable to delete HR record" });
  }
});

router.get("/documents/:id/download", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid HR document ID" });
    }
    const record = await HRRecord.findOne({ _id: req.params.id, module: "document" });
    if (!record?.filePath) return res.status(404).json({ success: false, message: "HR document not found" });
    const filePath = path.resolve(uploadDir, record.filePath);
    if (!filePath.startsWith(`${path.resolve(uploadDir)}${path.sep}`) || !fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "HR document file is unavailable" });
    }
    res.download(filePath, record.details?.fileName || record.title);
  } catch (error) {
    console.error("HR document download failed:", error);
    res.status(500).json({ success: false, message: "Unable to download HR document" });
  }
});

module.exports = router;
