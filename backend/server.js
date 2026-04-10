
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const syncRoutes = require("./routes/sync");
const db = require("./db");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Attach the sync routes to the /api/sync endpoint
app.use("/api/sync", syncRoutes);

app.get("/", (req, res) => {
  res.send("Backend running");
});

async function startServer() {
  try {
    await db.initializePool();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();