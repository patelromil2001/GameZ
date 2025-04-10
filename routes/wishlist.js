const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
// Riya - Wishlist 
// Add to Wishlist
router.post('/add/:id', async (req, res) => {
  try {
    const userId = req.session?.userId; 
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const gameId = req.params.id;
    const user = await User.findById(userId);

    if (!user.wishlist.includes(gameId)) {
      user.wishlist.push(gameId);
      await user.save();
    }

    res.status(200).json({ success: true, message: 'Game added to wishlist', wishlist: user.wishlist });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

// Remove from Wishlist
router.post('/remove/:id', async (req, res) => {
  try {
    const userId = req.session?.userId; 
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const gameId = req.params.id;
    const user = await User.findById(userId);

    user.wishlist = user.wishlist.filter(id => id.toString() !== gameId);
    await user.save();

    res.status(200).json({ success: true, message: 'Game removed from wishlist', wishlist: user.wishlist });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

// View Wishlist
router.get('/', async (req, res) => {
  try {
    const userId = req.session?.userId; 
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const user = await User.findById(userId).populate('wishlist');
    res.status(200).json({ success: true, message: 'Wishlist fetched successfully', wishlist: user.wishlist });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

module.exports = router;