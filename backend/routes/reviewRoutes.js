
const express = require("express");
const router = express.Router();

const Review = require("../models/Review");
const authMiddleware = require("../middleware/authMiddleware");

// Submit a new review (Public)
router.post("/", async (req, res) => {
  try {
    const { customerName, email, rating, comment } = req.body;

    if (
      !customerName?.trim() ||
      !email?.trim() ||
      !rating ||
      !comment?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all review details.",
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5.",
      });
    }

    if (comment.trim().length > 500) {
      return res.status(400).json({
        success: false,
        message: "Review cannot exceed 500 characters.",
      });
    }

    const newReview = new Review({
      customerName,
      email,
      rating: numericRating,
      comment,
      status: "Pending",
    });

    await newReview.save();

    res.status(201).json({
      success: true,
      message: "Thank you! Your review is submitted and awaiting approval.",
      review: newReview,
    });

  } catch (error) {
    console.error("Review submission error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to submit review.",
    });
  }
});

// Get approved reviews only (Public)
router.get("/", async (req, res) => {
  try {
    // Older reviews without status remain visible for now.
    const reviews = await Review.find({
      $or: [
        { status: "Approved" },
        { status: { $exists: false } },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews,
    });

  } catch (error) {
    console.error("Fetch public reviews error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch reviews.",
    });
  }
});

// Get all reviews (Admin only)
router.get("/admin/all", authMiddleware, async (req, res) => {
  try {
    const reviews = await Review.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      reviews,
    });

  } catch (error) {
    console.error("Fetch admin reviews error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch reviews.",
    });
  }
});

// Approve or reject a review (Admin only)
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["Approved", "Rejected"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review status.",
      });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: `Review ${status.toLowerCase()} successfully!`,
      review: updatedReview,
    });

  } catch (error) {
    console.error("Review status error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to update review status.",
    });
  }
});

// Delete review (Admin only)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deletedReview = await Review.findByIdAndDelete(
      req.params.id
    );

    if (!deletedReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully!",
    });

  } catch (error) {
    console.error("Delete review error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to delete review.",
    });
  }
});

module.exports = router;
