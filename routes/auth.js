const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User'); 

// Register Route - Process Registration
router.post('/register', async (req, res) => {
  try {
    console.log('Registering user:', req.body);
    const { name, email, password, password2 } = req.body;

    let errors = [];

    if (!name || !email || !password || !password2) {
      errors.push('Please fill in all fields');
    }

    if (password !== password2) {
      errors.push('Passwords do not match');
    }

    if (password.length < 6) {
      errors.push('Password should be at least 6 characters');
    }

    if (errors.length > 0) {
      console.log('Validation errors:', errors);
      return res.status(400).json({ errors });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    console.log('User registered successfully:', newUser);
    res.status(201).json({ message: 'User registered successfully', user: { id: newUser._id, name: newUser.name, email: newUser.email } });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login Route - Process Login (with validation)
router.post('/login', async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    const { email, password } = req.body;

    // Validate input fields
    if (!email || !password) {
      console.log('Missing email or password in login request');
      return res.status(400).json({ error: 'Please provide both email and password' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User not found with email: ${email}`);
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('Provided password:', password);
    console.log('Stored hashed password:', user.password);
    
    // verify password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);
    if (!isMatch) {
      console.log(`Invalid credentials for email: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create session for the user
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    req.session.userId = user._id; 

    console.log('User logged in successfully:', req.session.user);
    res.status(200).json({ message: 'Logged in successfully', user: req.session.user });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout Route - Destroy Session
router.get('/logout', (req, res) => {
  if (!req.session.user) {
    console.log('Logout attempt without being logged in');
    return res.status(401).json({ error: 'You are not logged in' });
  }

  req.session.destroy((err) => {
    if (err) {
      console.error('Error during logout:', err);
      return res.status(500).json({ error: 'Failed to log out' });
    }

    console.log('User logged out successfully');
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

module.exports = router;