const express = require('express');
const Game = require('../models/games'); 
const router = express.Router();

// Riya - Search by ID route
router.get('/:id', async (req, res) => {
  try {
    const gameId = req.params.id; 

    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Game fetched successfully',
      game,
    });
  } catch (error) {
    console.error('Error searching for game by ID:', error);

    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
});

module.exports = router;