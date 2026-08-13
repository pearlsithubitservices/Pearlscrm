const express = require("express");
const router = express.Router();

const PerformanceReview = require("../models/Performance/ReviewModel");

//CREATE REVIEW
router.post("/", async (req, res) => {
    try {
        const review = await PerformanceReview.create(req.body);

        res.status(201).json({
            success: true,
            message: "Review created successfully",
            data: review,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});


//GET REVIEW

router.get("/", async (req, res) => {
    try {
        const reviews = await PerformanceReview.find().sort({
            createdAt: -1,
        });

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

//GET REVIEW BY ID

router.get("/:employee_uid", async (req, res) => {
    try {
        const review = await PerformanceReview.findOne({
            employee_uid: req.params.employee_uid,
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }

        res.status(200).json({
            success: true,
            data: review,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

//UPDATE REVIEW

router.put("/:id", async (req, res) => {
    try {
        const review = await PerformanceReview.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Review updated successfully",
            data: review,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

//DELETE REVIEW

router.delete("/:id", async (req, res) => {
    try {
        const review = await PerformanceReview.findByIdAndDelete(
            req.params.id
        );

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Review deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

module.exports = router;
