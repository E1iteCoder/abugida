const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken, checkDatabase } = require('../middleware/auth');
const { authLimiter, preferencesLimiter } = require('../middleware/rateLimiter');
const { sanitizeUsername, sanitizeEmail } = require('../utils/sanitize');

// Register new user
router.post('/register', checkDatabase, authLimiter, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Sanitize and validate username
    const sanitizedUsername = sanitizeUsername(username);
    if (!sanitizedUsername) {
      return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores, and must be between 3 and 30 characters' });
    }

    // Sanitize and validate email
    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if username already exists (using sanitized value)
    const existingUsername = await User.findOne({ username: sanitizedUsername });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Check if email already exists (using sanitized value)
    const existingEmail = await User.findOne({ email: sanitizedEmail });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user (using sanitized values)
    const user = new User({
      username: sanitizedUsername,
      email: sanitizedEmail,
      password: hashedPassword,
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        themeMode: user.themeMode || 'auto',
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ error: `${field === 'username' ? 'Username' : 'Email'} already exists` });
    }
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login user (can use either username or email)
router.post('/login', checkDatabase, authLimiter, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password is required' });
    }

    if (!username && !email) {
      return res.status(400).json({ error: 'Username or email is required' });
    }

    // Sanitize and find user by username or email
    let user;
    if (username) {
      // Sanitize username before query
      const sanitizedUsername = sanitizeUsername(username);
      if (!sanitizedUsername) {
        return res.status(400).json({ error: 'Invalid username format' });
      }
      user = await User.findOne({ username: sanitizedUsername });
    } else {
      // Sanitize email before query
      const sanitizedEmail = sanitizeEmail(email);
      if (!sanitizedEmail) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      user = await User.findOne({ email: sanitizedEmail });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        themeMode: user.themeMode || 'auto',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get current user (protected route)
router.get('/me', checkDatabase, authenticateToken, authLimiter, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        themeMode: user.themeMode || 'auto',
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user preferences (protected route)
router.put('/preferences', checkDatabase, authenticateToken, preferencesLimiter, async (req, res) => {
  try {
    const { themeMode } = req.body;

    // Validate themeMode if provided
    if (themeMode && !['auto', 'light', 'dark'].includes(themeMode)) {
      return res.status(400).json({ error: 'Invalid themeMode. Must be "auto", "light", or "dark"' });
    }

    // Build update object
    const updateData = {};
    if (themeMode !== undefined) {
      updateData.themeMode = themeMode;
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Preferences updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        themeMode: user.themeMode || 'auto',
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Server error updating preferences' });
  }
});

// Get user progress (protected route)
router.get('/progress', checkDatabase, authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('progress');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      progress: user.progress || {
        completedSections: {},
        quizScores: {},
        stats: {
          totalLessonsCompleted: 0,
          totalQuizzesCompleted: 0,
          averageQuizScore: 0,
          lastActivity: new Date(),
        },
      },
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Server error fetching progress' });
  }
});

// Update user progress (protected route)
router.put('/progress', checkDatabase, authenticateToken, preferencesLimiter, async (req, res) => {
  try {
    const { topicKey, section, page, completed, score } = req.body;

    // Validate required fields
    if (!topicKey || !section || page === undefined) {
      return res.status(400).json({ error: 'topicKey, section, and page are required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initialize progress if it doesn't exist
    if (!user.progress) {
      user.progress = {
        completedSections: {},
        quizScores: {},
        stats: {
          totalLessonsCompleted: 0,
          totalQuizzesCompleted: 0,
          averageQuizScore: 0,
          lastActivity: new Date(),
        },
      };
    }

    // Initialize nested objects if they don't exist
    if (!user.progress.completedSections[topicKey]) {
      user.progress.completedSections[topicKey] = {};
    }
    if (!user.progress.completedSections[topicKey][section]) {
      user.progress.completedSections[topicKey][section] = {};
    }
    if (!user.progress.quizScores[topicKey]) {
      user.progress.quizScores[topicKey] = {};
    }
    if (!user.progress.quizScores[topicKey][section]) {
      user.progress.quizScores[topicKey][section] = {};
    }

    // Update completion status
    if (completed !== undefined) {
      const pageKey = page.toString();
      const wasCompleted = user.progress.completedSections[topicKey][section][pageKey];
      
      user.progress.completedSections[topicKey][section][pageKey] = completed;
      
      // Update stats
      if (completed && !wasCompleted) {
        if (section === 'Quiz') {
          user.progress.stats.totalQuizzesCompleted = (user.progress.stats.totalQuizzesCompleted || 0) + 1;
        } else {
          user.progress.stats.totalLessonsCompleted = (user.progress.stats.totalLessonsCompleted || 0) + 1;
        }
      } else if (!completed && wasCompleted) {
        if (section === 'Quiz') {
          user.progress.stats.totalQuizzesCompleted = Math.max(0, (user.progress.stats.totalQuizzesCompleted || 0) - 1);
        } else {
          user.progress.stats.totalLessonsCompleted = Math.max(0, (user.progress.stats.totalLessonsCompleted || 0) - 1);
        }
      }
    }

    // Update quiz score
    if (score !== undefined && section === 'Quiz') {
      const pageKey = page.toString();
      user.progress.quizScores[topicKey][section][pageKey] = score;
      
      // Recalculate average quiz score
      const allScores = [];
      Object.values(user.progress.quizScores).forEach(topic => {
        Object.values(topic).forEach(sec => {
          Object.values(sec).forEach(s => {
            if (typeof s === 'number') allScores.push(s);
          });
        });
      });
      
      if (allScores.length > 0) {
        user.progress.stats.averageQuizScore = Math.round(
          allScores.reduce((sum, s) => sum + s, 0) / allScores.length
        );
      }
    }

    // Update last activity
    user.progress.stats.lastActivity = new Date();

    await user.save();

    res.json({
      message: 'Progress updated successfully',
      progress: user.progress,
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Server error updating progress' });
  }
});

module.exports = router;

