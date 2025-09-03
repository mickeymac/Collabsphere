const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Import Routes
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");

// Routes
app.use("/api/auth", authRoutes); // 👈 Authentication routes (Register, Login, Forgot Password)
app.use("/api/projects", projectRoutes); // 👈 Project routes (CRUD, Collaborators)

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Connect MongoDB
const connectDB = require("./config/db");
connectDB()
  .then(() => {
    console.log("MongoDB connected ✅");
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.log(err));
