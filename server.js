const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const morgan = require("morgan");
const methodOverride = require("method-override");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const auth = require("./middleware/auth");

require("dotenv").config();

// Initialize app
const app = express();

// Connect to database
connectDB();

// view and publlic folder setup
// Serve static files from public folder
app.use(express.static(path.join(__dirname, "public")));

// Set EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: false })); 
app.use(methodOverride("_method")); 
app.use(morgan("dev")); 
app.use(bodyParser.json());
app.use(cookieParser());

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "gamesecret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { maxAge: 60 * 60 * 1000 }, 
  })
);

// Global variables middleware
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Routes
app.use("/auth", require("./routes/auth")); 
app.use("/games", require("./routes/games")); 

const wishlistRoutes = require("./routes/wishlist");
const searchRoutes = require('./routes/search');

app.use('/search', searchRoutes);
app.use("/", wishlistRoutes);


// Dashboard Start Up Page
app.get("/", async (req, res) => {
  res.render("main.ejs", { title: "Home", body: "./pages/dashboard" });
});

// Home Page
app.get("/home",auth, async (req, res) => {
  res.render("main.ejs", { title: "Home", body: "./pages/home" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Page Not Found" });
});

// Server setup
const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || "localhost";
app.listen(PORT, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
