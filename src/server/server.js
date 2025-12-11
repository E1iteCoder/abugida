const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Load environment variables from project root (for local development only)
// In Railway, environment variables are set directly, so this is optional
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.join(__dirname, '../../.env') });
}

const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CORS configuration - allow requests from your domain
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'https://theabugida.org',
      'https://www.theabugida.org',
      'http://localhost:3000',
      'http://localhost:3001',
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection (non-blocking - server starts even if DB fails)
const db = require('./db');
db.connect().catch(err => {
  console.error('Failed to initialize database connection:', err);
  // Server continues to run even if DB connection fails
});

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const isConnected = dbStatus === 1;
  
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    database: isConnected ? 'connected' : 'disconnected'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;

