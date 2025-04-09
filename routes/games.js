const express = require('express');
const router = express.Router();
const Game = require('../models/Game');

// ROMIL PATEL - Home route and game catalog display
router.get('/', async (req, res) => {
  try {
    // Getting the total number of games for pagination data
    const totalGames = await Game.countDocuments({});
    
  // Display the catalog with first page of games
    const games = await Game.find({})
      .sort({ name: 1 })
      .limit(12);
    
    res.render('index', {
      title: 'GameZ - Game Catalog',
      games,
      totalGames,
      currentPage: 1,
      pages: Math.ceil(totalGames / 12)
    });
  } catch (err) {
    console.error(err);
    res.render('error', {
      title: 'Server Error',
      message: 'Failed to load games'
    });
  }
});

// ROMIL PATEL - Game detail page
router.get('/games/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    
    if (!game) {
      return res.status(404).render('404', {
        title: 'Game Not Found'
      });
    }
    
    // Get similar games based on genre
    const similarGames = await Game.find({
      _id: { $ne: game._id },
      genres: { $in: game.genres }
    })
    .limit(6);
    
    // Check if game is in user's wishlist
    let inWishlist = false;
    if (req.session.user) {
      const User = require('../models/User');
      const user = await User.findById(req.session.user.id);
      inWishlist = user.wishlist.includes(game._id);
    }
    
    res.render('games/detail', {
      title: game.name,
      game,
      similarGames,
      inWishlist
    });
  } catch (err) {
    console.error(err);
    res.render('error', {
      title: 'Server Error',
      message: 'Failed to load game details'
    });
  }
});

// VAISAKH  - Pagination for game catalog
router.get('/games/page/:page', async (req, res) => {
  try { // DEVWRAT RAVAL
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
        case 'rating_desc':
          // We'll need custom handling for this since it's a virtual
          break;
        default:
          sortOption = { name: 1 };
      }
    }
  }})

module.exports = router;