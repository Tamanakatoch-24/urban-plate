
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const reservationRoutes = require("./routes/reservationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

// Home Route
app.get("/", (req, res) => {
  res.send("Urban Plate Backend is Running!");
});

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    message: "Backend is working successfully!",
  });
});

// API Routes
app.use("/api/reservations", reservationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");

    app.listen(process.env.PORT || 5000, () => {
      console.log(
        `Server running on port ${process.env.PORT || 5000}`
      );
    });
  })
  .catch((error) => {
    console.log("MongoDB Connection Error:", error.message);
  });
