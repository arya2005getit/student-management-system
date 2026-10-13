require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const studentRoutes = require("./src/routes/students");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

app.use("/api/students", studentRoutes);

app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found." });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ message: "Request body must contain valid JSON." });
  }

  console.error(err);
  res.status(500).json({ message: "An unexpected server error occurred." });
});

async function startServer() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is required. Add it to your .env file.");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");
    app.listen(port, () => {
      console.log(`Student Management API is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Could not connect to MongoDB:", error.message);
    process.exit(1);
  }
}

startServer();
