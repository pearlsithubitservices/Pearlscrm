const express = require("express");
const router = express.Router();
const Client = require("../models/Clients");

// CREATE CLIENT
router.post("/", async (req, res) => {
    try {
        const payload = { ...req.body };
        if (payload.healthScore !== undefined) {
            payload.healthScore = Number(payload.healthScore);
        }

        const client = await Client.create(payload);
        res.status(201).json(client);
    } catch (error) {
        console.error("Error creating client:", error);
        res.status(500).json({ message: "Failed to create client" });
    }
});

// GET ALL CLIENTS
router.get("/", async (req, res) => {
    try {
        const clients = await Client.find().sort({ createdAt: -1 });
        res.json(clients);
    } catch (error) {
        console.error("Error fetching clients:", error);
        res.status(500).json({ message: "Failed to fetch clients" });
    }
});

// GET CLIENT BY ID
router.get("/:id", async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);
        if (!client) {
            return res.status(404).json({ message: "Client not found" });
        }
        res.json(client);
    } catch (error) {
        console.error("Error fetching client:", error);
        res.status(500).json({ message: "Failed to fetch client" });
    }
});

// UPDATE CLIENT
router.put("/:id", async (req, res) => {
    try {
        const payload = { ...req.body };
        if (payload.healthScore !== undefined) {
            payload.healthScore = Number(payload.healthScore);
        }

        const client = await Client.findByIdAndUpdate(req.params.id, payload, {
            new: true,
            runValidators: true,
        });

        if (!client) {
            return res.status(404).json({ message: "Client not found" });
        }

        res.json(client);
    } catch (error) {
        console.error("Error updating client:", error);
        res.status(500).json({ message: "Failed to update client" });
    }
});

module.exports = router;