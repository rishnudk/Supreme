const app = require("./app");
const connectDB = require("./config/db");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB(); 
    console.log("✅ Connected to MongoDB");

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // Handle graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n🔻 Received ${signal}, shutting down server...`);

      try {
        await mongoose.connection.close();
        console.log("✅ MongoDB connection closed.");
      } catch (err) {
        console.error("❌ Error closing MongoDB connection:", err);
      }

      server.close(() => {
        console.log("✅ Server closed. Exiting process...");
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (err) {
    console.error("❌ Server startup error:", err);
    process.exit(1);
  }
}

startServer();
