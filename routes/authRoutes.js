// expresss routhes for authenciation 
// register, login , profile
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const User = require('../models/user');

// User Registration Form (if still needed for web interface)
router.get('/register', (req, res) => {
  if (req.session.user) {
    return res.status(200).json({ 
      success: false,
      message: 'User already logged in',
      redirect: '/games'
    });
  }
  res.status(200).json({ 
    success: true,
    message: 'Registration endpoint ready'
  });
});

// User Registration Process
router.post('/register', [
  check('username')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters'),
  check('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  check('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { username, email, password } = req.body;
    
    // Check for existing user
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered'
      });
    }
    
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken'
      });
    }
    
    // Create and save user
    const newUser = new User({ username, email, password });
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);
    await newUser.save();
    
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      redirect: '/users/login'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// Login Process
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Create session
    req.session.user = {
      _id: user._id,
      username: user.username,
      email: user.email
    };
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
      redirect: '/games'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Profile Page
router.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - please log in'
    });
  }
  
  res.status(200).json({
    success: true,
    user: req.session.user
  });
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Logout successful',
      redirect: '/users/login'
    });
  });
});

module.exports = router;