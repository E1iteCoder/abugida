const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const db = require('../db');

// Middleware to check if database is connected
const checkDatabase = (req, res, next) => {
  if (!db.isConnected()) {
    return res.status(503).json({ 
      error: 'Database unavailable',
      message: 'The database is not currently connected. Please try again later.'
    });
  }
  next();
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || 'your-secret-key-change-this',
    (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }
      req.userId = decoded.userId;
      next();
    }
  );
};

module.exports = { authenticateToken, checkDatabase };

