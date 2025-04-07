// gmae caltlog and whishlist routers
const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const sortingMiddleware = require('../middleware/sorting');
const { isAuthenticated } = require('../middleware/auth');

// Apply sorting middleware to all game routes
router.use(sortingMiddleware);

// Game catalog with pagination and sorting
router.get('/', async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = 12; // Games per page
    const skip = (page - 1) * limit;
    
    // Build query based on filters 
    let query = {};
    
    // Use the sort criteria from the sorting middleware
    const sortCriteria = req.sortCriteria;
    
    // Execute query with pagination and sorting
    const games = await Game.find(query)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const totalGames = await Game.countDocuments(query);
    const totalPages = Math.ceil(totalGames / limit);
    
    res.render('games/index', {
      title: 'Game Catalog',
      games,
      currentPage: page,
      totalPages,
      totalGames,
      // The sort options are already in res.locals from the middleware
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading game catalog');
    res.redirect('/');
  }
});




module.exports = router;