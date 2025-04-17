const express = require('express');
const Game = require('../models/games'); 
const router = express.Router();

// Riya - Search by Name route
router.get('/search', async (req, res) => {
  try {
    const gameName = req.query.name; 

    if (!gameName) {
      return res.status(400).json({
        success: false,
        message: 'Game name is required',
      });
    }

    const games = await Game.find({ name: new RegExp(gameName, 'i') });

    if (games.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No games found matching the search query',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Games fetched successfully',
      games,
    });
  } catch (error) {
    console.error('Error searching for games by name:', error);

    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
});

router.get('/results', async (req, res) => {
  try {
    const query = req.query.query; 
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const results = await Game.find({ name: new RegExp(query, 'i') }); 

    res.render('pages/search', {
      query: query,
      results: results,
    });
  } catch (error) {
    console.error('Error fetching search results:', error);
    res.status(500).json({ error: 'Server error occurred while searching' });
  }
});

module.exports = router;