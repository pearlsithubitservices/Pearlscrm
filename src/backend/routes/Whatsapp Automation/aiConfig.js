const express = require("express");
const router = express.Router();

const AIConfig = require("../../models/AIConfig");

/*
  GET AI CONFIGURATION
*/
router.get("/", async (req, res) => {
  try {
    let config = await AIConfig.findOne();

    /*
      Create default configuration
      if none exists.
    */
    if (!config) {
      config = await AIConfig.create({});
    }

    res.status(200).json(config);
  } catch (error) {
    console.error(
      "Get AI configuration error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch AI configuration",
      error: error.message,
    });
  }
});

/*
  UPDATE AI CONFIGURATION
*/
router.put("/", async (req, res) => {
  try {
    const {
      enabled,
      provider,
      model,
      systemInstructions,
      temperature,
      maxTokens,
      humanHandoff,
    } = req.body;

    let config = await AIConfig.findOne();

    /*
      Create configuration if
      it doesn't exist.
    */
    if (!config) {
      config = new AIConfig();
    }

    if (enabled !== undefined) {
      config.enabled = enabled;
    }

    if (provider !== undefined) {
      config.provider = provider;
    }

    if (model !== undefined) {
      config.model = model;
    }

    if (
      systemInstructions !==
      undefined
    ) {
      config.systemInstructions =
        systemInstructions;
    }

    if (temperature !== undefined) {
      config.temperature = temperature;
    }

    if (maxTokens !== undefined) {
      config.maxTokens = maxTokens;
    }

    if (
      humanHandoff !== undefined
    ) {
      config.humanHandoff =
        humanHandoff;
    }

    await config.save();

    res.status(200).json({
      message:
        "AI configuration updated successfully",
      config,
    });
  } catch (error) {
    console.error(
      "Update AI configuration error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to update AI configuration",
      error: error.message,
    });
  }
});

module.exports = router;