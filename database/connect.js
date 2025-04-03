const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME,
    });
    console.log("MongoDB Connected ✅");
  } catch (err) {
    console.error("Database connection error ❌:", err);
    process.exit(1);
  }
};

const dbMiddleware = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }
  next();
};

module.exports = { connectDB, dbMiddleware };
