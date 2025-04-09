const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const { connectDB } = require("./database/connect");
require("dotenv").config();
const mongoose = require('mongoose');
const session = require('express-session');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const methodOverride = require('method-override');


const app = express();
const PORT = process.env.PORT;
const HOST = process.env.HOST;

// Import Routes
const gameRoutes = require('./routes/games');
const userRoutes = require('./routes/users');



// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));


// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET ,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI ,
    ttl: 14 * 24 * 60 * 60 // = 14 days
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Global variables - only user session remains
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});



// Serve static files from public folder
app.use(express.static(path.join(__dirname, "public")));

// Set EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// Routes
app.use('./routes/games', gameRoutes);
app.use('./routes/users', userRoutes);


// Home route
app.get("/", (req, res) => {
  res.render("main.ejs", { title: "Home", body: "./pages/dashboard" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
