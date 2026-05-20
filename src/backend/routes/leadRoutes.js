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
router.get("/hot", async (req, res) => {
  try {
    const data = await Lead.find({ leadTemp: "Hot" });

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
});
module.exports =
  router;