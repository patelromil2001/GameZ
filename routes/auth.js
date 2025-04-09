// DEVWRAT RAVAL - Authentication Routes (User Registration, Login/Logout & Session Management)
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { ensureAuth, ensureGuest } = require('../middleware/auth');

// Show Register Page
router.get('/register', ensureGuest, (req, res) => {
  res.render('register', {
    title: 'Register'
  });
});

// Process Register
router.post('/register', ensureGuest, async (req, res) => {
  try {
    const { name, email, password, password2 } = req.body;
    
    // Validation
    let errors = [];
    
    if (!name || !email || !password || !password2) {
      errors.push({ msg: 'Please fill in all fields' });
    }
    
    if (password !== password2) {
      errors.push({ msg: 'Passwords do not match' });
    }
    
    if (password.length < 6) {
      errors.push({ msg: 'Password should be at least 6 characters' });
    }
    
    if (errors.length > 0) {
      return res.render('register', {
        title: 'Register',
        errors,
        name,
        email
      });
    }
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      errors.push({ msg: 'Email is already registered' });
      return res.render('register', {
        title: 'Register',
        errors,
        name,
        email
      });
    }
    
    // Create new user
    const newUser = new User({
      name,
      email,
      password
    });
    
    await newUser.save();
    
    req.session.success_msg = 'You are now registered and can log in';
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    res.render('error', {
      title: 'Server Error',
      message: 'Something went wrong. Please try again.'
    });
  }
});

// Show Login Page
router.get('/login', ensureGuest, (req, res) => {
  res.render('login', {
    title: 'Login'
  });
});

// Process Login
router.post('/login', ensureGuest, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.render('login', {
        title: 'Login',
        errors: [{ msg: 'Please fill in all fields' }],
        email
      });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.render('login', {
        title: 'Login',
        errors: [{ msg: 'Invalid credentials' }],
        email
      });
    }
    
    // Match password
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      return res.render('login', {
        title: 'Login',
        errors: [{ msg: 'Invalid credentials' }],
        email
      });
    }
    
    // Create session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email
    };
    
    const returnTo = req.session.returnTo || '/';
    delete req.session.returnTo;
    
    res.redirect(returnTo);
  } catch (err) {
    console.error(err);
    res.render('error', {
      title: 'Server Error',
      message: 'Something went wrong. Please try again.'
    });
  }
});

// Logout
router.get('/logout', ensureAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/');
  });
});

module.exports = router;