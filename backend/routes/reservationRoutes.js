
const express = require("express");
const router = express.Router();

const Reservation = require("../models/Reservation");
const authMiddleware = require("../middleware/authMiddleware");

// Reusable function to send emails through Resend
async function sendEmail(to, subject, html) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is missing in .env file");
  }

  if (!process.env.SENDER_EMAIL) {
    throw new Error("SENDER_EMAIL is missing in .env file");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: `Urban Plate <${process.env.SENDER_EMAIL}>`,
      to: [to],
      subject,
      html,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || JSON.stringify(result));
  }

  console.log("✅ Email sent:", result.id);
  return result;
}

// Create reservation + send confirmation email
router.post("/", async (req, res) => {
  console.log("📩 Reservation POST route called");

  try {
    const { name, email, date, time, guests } = req.body;

    if (!name || !email || !date || !time || !guests) {
      return res.status(400).json({
        success: false,
        message: "Please fill all reservation details.",
      });
    }

    const newReservation = new Reservation({
      name,
      email,
      date,
      time,
      guests,
    });

    await newReservation.save();

    console.log("✅ Reservation saved successfully");

    let emailSent = false;

    try {
      const emailResult = await sendEmail(
        email,
        "Your Urban Plate Reservation Received",
        `
          <div style="font-family:Arial,sans-serif;padding:25px;color:#222;">
            <h1 style="color:#b99735;">Urban Plate</h1>
            <h2>Reservation Received!</h2>
            <p>Hello ${name},</p>
            <p>Thank you for choosing Urban Plate.
            Your reservation has been received successfully.</p>

            <h3>Reservation Details</h3>
            <p><b>Name:</b> ${name}</p>
            <p><b>Date:</b> ${date}</p>
            <p><b>Time:</b> ${time}</p>
            <p><b>Guests:</b> ${guests}</p>
            <p>We look forward to welcoming you!</p>
            <h3>Team Urban Plate</h3>
          </div>
        `
      );

      emailSent = true;
      console.log("✅ Reservation email sent:", emailResult.id);

    } catch (emailError) {
      console.error("❌ Reservation email error:", emailError.message);
    }

    return res.status(201).json({
      success: true,
      message: "Reservation received successfully!",
      emailSent,
      reservation: newReservation,
    });

  } catch (error) {
    console.error("❌ Reservation error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Reservation failed.",
      error: error.message,
    });
  }
});

// Get all reservations (Admin only)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      reservations,
    });

  } catch (error) {
    console.error("Get reservations error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Delete reservation (Admin only)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deletedReservation = await Reservation.findByIdAndDelete(
      req.params.id
    );

    if (!deletedReservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Reservation deleted successfully!",
    });

  } catch (error) {
    console.error("Delete reservation error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to delete reservation.",
      error: error.message,
    });
  }
});

// Update reservation status + notify customer (Admin only)
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["Pending", "Confirmed", "Completed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reservation status.",
      });
    }

    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedReservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    let emailSent = false;

    try {
      let subject = "Your Urban Plate Reservation Update";
      let statusMessage = "Your reservation status has been updated.";

      if (status === "Confirmed") {
        subject = "Your Urban Plate Reservation is Confirmed!";
        statusMessage =
          "Great news! Your reservation has been confirmed. We look forward to welcoming you!";
      } else if (status === "Completed") {
        subject = "Thank You for Visiting Urban Plate!";
        statusMessage =
          "Your reservation has been marked as completed. Thank you for choosing Urban Plate!";
      } else if (status === "Pending") {
        statusMessage =
          "Your reservation is currently pending. We will update you once it is reviewed.";
      }

      const emailResult = await sendEmail(
        updatedReservation.email,
        subject,
        `
          <div style="font-family:Arial,sans-serif;padding:25px;color:#222;">
            <h1 style="color:#b99735;">Urban Plate</h1>
            <h2>Reservation Status Update</h2>

            <p>Hello ${updatedReservation.name},</p>
            <p>${statusMessage}</p>

            <h3>Reservation Details</h3>
            <p><b>Date:</b> ${updatedReservation.date}</p>
            <p><b>Time:</b> ${updatedReservation.time}</p>
            <p><b>Guests:</b> ${updatedReservation.guests}</p>
            <p><b>Current Status:</b> ${status}</p>

            <p>Thank you for choosing Urban Plate.</p>
            <h3>Team Urban Plate</h3>
          </div>
        `
      );

      emailSent = true;
      console.log("✅ Status update email sent:", emailResult.id);

    } catch (emailError) {
      console.error("❌ Status update email error:", emailError.message);
    }

    return res.status(200).json({
      success: true,
      message: "Reservation status updated successfully!",
      emailSent,
      reservation: updatedReservation,
    });

  } catch (error) {
    console.error("Update status error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update reservation status.",
      error: error.message,
    });
  }
});

module.exports = router;
