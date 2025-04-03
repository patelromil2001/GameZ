const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const { connectDB } = require("./database/connect");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT;
const HOST = process.env.HOST;

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Serve static files from public folder
app.use(express.static(path.join(__dirname, "public")));

// Set EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Home route
app.get("/", (req, res) => {
  res.render("main.ejs", { title: "Home", body: "./pages/dashboard" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
