// Main application file
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const morgan = require('morgan');
const methodOverride = require('method-override');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');

require('dotenv').config();


// Initialize app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded bodies
app.use(methodOverride('_method')); // For HTTP method overrides
app.use(morgan('dev')); // Logging HTTP requests
app.use(bodyParser.json());


// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'gamesecret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { maxAge: 60 * 60 * 1000 } // Sessions last for 1 hour
  })
);

// Global variables middleware
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Routes
app.use('/auth', require('./routes/auth')); // Authentication routes
app.use('/wishlist', require('./routes/wishlist')); // Wishlist routes
app.use('/games', require('./routes/games')); // Game-related routes
app.use('/search', require('./routes/search')); // Search routes

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Page Not Found' });
});

// Server setup
const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || 'localhost';
app.listen(PORT, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});