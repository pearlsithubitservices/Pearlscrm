const express = require("express");

const router = express.Router();

const Followup = require("../models/Followup");

router.post("/", async (req, res) => {

  try {

    const followup =
      await Followup.create(req.body);

    res.json(followup);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});

router.get("/", async (req, res) => {

  try {

    const followups =
      await Followup.find().sort({
        createdAt: -1
      });

    res.json(followups);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});

module.exports = router;