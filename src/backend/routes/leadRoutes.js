const express =
  require("express");

const router =
  express.Router();

const Lead =
  require("../models/Leads");
const Notification = require("../models/CommunicationModels/Notifications");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const leadUploadDirectory = path.join(__dirname, "../uploads/leads");
fs.mkdirSync(leadUploadDirectory, { recursive: true });

const upload = multer({
  dest: leadUploadDirectory,
  limits: { fileSize: 10 * 1024 * 1024 },
});





// CREATE LEAD

router.post(
  "/",
  async (req, res) => {

    try {



      const lead =
        await Lead.create(
          req.body
        );

      res.json(lead);

    } catch (error) {

      res.status(500).json({
        message:
          error.message,
      });

    }

  }
);

// SAVE A LEAD NEXT ACTION AND ALERT THE ASSIGNED EMPLOYEE
router.put("/:id/next-action", async (req, res) => {
  try {
    const { nextAction, nextActionDate, followUpCount } = req.body;
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        nextAction: nextAction || "",
        nextActionDate: nextActionDate || null,
        followUpCount: Number.isFinite(Number(followUpCount)) ? Number(followUpCount) : 0,
      },
      { new: true, runValidators: true }
    );

    if (!lead) return res.status(404).json({ message: "Lead not found" });

    if (lead.assignedTo) {
      await Notification.create({
        title: `Next action updated for ${lead.name || "lead"}`,
        sub: nextAction || "Follow-up required",
        notificationType: "Lead",
        employeeId: lead.assignedTo,
        isImportant: true,
      });
    }

    return res.json(lead);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// UPLOAD AND SAVE LEAD DOCUMENT METADATA
router.post("/:id/documents", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "A file is required" });

    const document = {
      name: req.file.originalname,
      type: path.extname(req.file.originalname).slice(1).toUpperCase() || "FILE",
      size: req.file.size,
      url: `/uploads/leads/${req.file.filename}`,
    };
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { $push: { documents: { $each: [document], $position: 0 } } },
      { new: true, runValidators: true }
    );

    if (!lead) return res.status(404).json({ message: "Lead not found" });
    return res.status(201).json(lead);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// DELETE A LEAD DOCUMENT AND ITS STORED FILE
router.delete("/:leadId/documents/:documentId", async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.leadId);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    const document = lead.documents.id(req.params.documentId);
    if (!document) return res.status(404).json({ message: "Document not found" });

    const filePath = path.join(__dirname, "..", document.url.replace(/^\//, ""));
    await fs.promises.unlink(filePath).catch(() => {});
    document.deleteOne();
    await lead.save();
    return res.json(lead);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});


// GET ALL LEADS

router.get(
  "/",
  async (req, res) => {

    try {

      const leads =
        await Lead.find()
          .sort({
            createdAt: -1,
          });

      res.json(leads);

    } catch (error) {




      
      res.status(500).json({
        message:
          error.message,
      });

    }

  }
);


// UPDATE LEAD

router.put(
  "/:id",
  async (req, res) => {

    try {

      const updatedLead =
        await Lead.findByIdAndUpdate(req.params.id, req.body, {
          returnDocument: "after",
        });

      res.json(
        updatedLead
      );

    } catch (error) {

      res.status(500).json({
        message:
          error.message,
      });

    }

  }
);


// BULK EXCEL IMPORT

router.post(
  "/bulk",
  async (req, res) => {

    try {

      const leads =
        await Lead.insertMany(
          req.body
        );

      res.json(leads);

    } catch (error) {

      res.status(500).json({
        message:
          error.message,
      });

    }

  }
);
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Lead.findById(id);

    if (!data) {
      res.status(404).json();

    }

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
});

// notes

router.post("/:id/notes", async (req, res) => {
  try {
    const { title, description } = req.body;

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    lead.leadnotes.push({
      title,
      description,
    });

    await lead.save();

    res.status(200).json(lead);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// DELETE A LEAD ACTIVITY
router.delete("/:leadId/activities/:activityId", async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.leadId);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    const activity = lead.activities.id(req.params.activityId);
    if (!activity) return res.status(404).json({ message: "Activity not found" });

    activity.deleteOne();
    await lead.save();
    return res.json(lead);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// DELETE LEAD

router.delete("/:id", async (req, res) => {
  try {
    const deletedLead = await Lead.findByIdAndDelete(req.params.id);

    if (!deletedLead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    await Promise.all(
      (deletedLead.documents || []).map((document) => {
        const filePath = path.join(__dirname, "..", document.url.replace(/^\//, ""));
        return fs.promises.unlink(filePath).catch(() => {});
      })
    );

    return res.status(200).json({
      message: "Lead deleted successfully",
      lead: deletedLead,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

// DELETE SINGLE NOTE

router.delete("/:leadId/notes/:noteId", async (req, res) => {
  try {
    const { leadId, noteId } = req.params;

    const lead = await Lead.findById(leadId);

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    lead.leadnotes = lead.leadnotes.filter(
      (note) => note._id.toString() !== noteId
    );

    await lead.save();

    return res.status(200).json(lead);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

module.exports =
  router;