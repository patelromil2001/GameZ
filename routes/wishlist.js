const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const authenticateUser = require('../middleware/auth');
// Riya - Wishlist 
// Add to Wishlist
router.post('/add/:id', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.userId; 
    const gameId = req.params.id; 

    const user = await User.findById(userId); 

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

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

// Remove from Wishlist Route
router.post('/remove/:id', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.userId; 
    const gameId = req.params.id; 
    const user = await User.findById(userId); 

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.wishlist = user.wishlist.filter((id) => id.toString() !== gameId);
    await user.save(); 
    return res.redirect('/wishlist');
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return res.status(500).render('pages/wishlist', {
      message: 'Server error occurred while removing the game.',
      wishlist: [],
    });
  }
});

// Fetch Wishlist Route
router.get('/wishlist', authenticateUser, async (req, res) => {
  try {
    console.log('Fetching wishlist...');
    const userId = req.user.userId; 
    const user = await User.findById(userId).populate('wishlist');

    if (!user) {
      return res.render('pages/wishlist', {
        message: 'User not found',
        wishlist: [],
      });
    }

    console.log('GOING TO WIShLIST PAGE...');
    res.render('pages/wishlist', {
      wishlist: user.wishlist,
      message: null,
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.render('pages/wishlist', {
      message: 'Server error',
      wishlist: [],
    });
  }
});

module.exports = router;