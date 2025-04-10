const express = require('express');
const router = express.Router();
const Game = require('../models/games');

// Home route and game catalog display
router.get('/', async (req, res) => {
  try {
    const totalGames = await Game.countDocuments({});
    
    const games = await Game.find({})
      .sort({ name: 1 })
      .limit(12);
    
    res.status(200).json({
      success: true,
      message: 'Game catalog fetched successfully',
      games,
      totalGames,
      currentPage: 1,
      pages: Math.ceil(totalGames / 12)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to load games',
      error: err.message
    });
  }
});

// Game detail page
router.get('/games/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
      });
    }

    res.status(200).json({
      success: true,
      game,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to load game details',
      error: err.message,
    });
  }
});


// VAISAKH  - Pagination for game catalog
router.get('/games/page/:page', async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    let sortOption = { name: 1 }; 
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'name_asc':
          sortOption = { name: 1 };
          break;
        case 'name_desc':
          sortOption = { name: -1 };
          break;
        case 'price_asc':
          sortOption = { price: 1 };
          break;
        case 'price_desc':
          sortOption = { price: -1 };
          break;
        case 'date_asc':
          sortOption = { release_date: 1 };
          break;
        case 'date_desc':
          sortOption = { release_date: -1 };
          break;
        default:
          sortOption = { name: 1 };
      }
    }

    const totalGames = await Game.countDocuments({});
    const games = await Game.find({})
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: 'Games fetched successfully',
      games,
      totalGames,
      currentPage: page,
      pages: Math.ceil(totalGames / limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to load games',
      error: err.message
    });
  }
});

module.exports = router;