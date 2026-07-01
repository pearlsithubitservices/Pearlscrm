const express =
  require("express");

const router =
  express.Router();

const Lead =
  require("../models/Leads");





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
        await Lead.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            new: true,
          }
        );

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

// DELETE LEAD

router.delete("/:id", async (req, res) => {
  try {
    const deletedLead = await Lead.findByIdAndDelete(req.params.id);

    if (!deletedLead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

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