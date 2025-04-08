// game catalog and wishlist routers
const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const sortingMiddleware = require('../middleware/sorting');
const { isAuthenticated } = require('../middleware/auth');

// Apply sorting middleware to all game routes
router.use(sortingMiddleware);

// Game catalog with sorting (pagination can be added)
router.get('/', async (req, res) => {
  try {
    // Build query based on filters 
    let query = {};

    // Use the sort criteria from the sorting middleware
    const sortCriteria = req.sortCriteria;

    // Execute query with sorting only (pagination can be added)
    const games = await Game.find(query)
      .sort(sortCriteria)
      .lean();

    res.render('games/index', {
      title: 'Game Catalog',
      games,
      // pagination-related variables can be added 
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading game catalog');
    res.redirect('/');
  }
});

module.exports = router;
