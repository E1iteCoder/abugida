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

// Trust proxy (important for rate limiting behind Railway/Cloudflare)
// This ensures rate limiting works correctly with the real client IP
app.set('trust proxy', 1);

// Middleware
// CORS configuration - allow requests from your domain
const allowedOrigins = [
  'https://theabugida.org',
  'https://www.theabugida.org',
  'https://api.theabugida.org',
  'http://localhost:3000',
  'http://localhost:3001',
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or if in development mode
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      // Log for debugging
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Explicitly handle preflight requests for all routes
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    res.sendStatus(204);
  } else {
    res.sendStatus(403);
  }
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Origin: ${req.get('origin') || 'none'}`);
  next();
});

// Database connection (non-blocking - server starts even if DB fails)
const db = require('./db');
console.log('Attempting MongoDB connection...');
db.connect().then(success => {
  if (success) {
    console.log('MongoDB connection initialized successfully');
  } else {
    console.log('MongoDB connection will retry in background');
  }
}).catch(err => {
  console.error('Failed to initialize database connection:', err);
  // Server continues to run even if DB connection fails
});

// Root endpoint for testing
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API server is running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth'
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint (both /health and /api/health for convenience)
const healthCheck = (req, res) => {
  console.log('Health check endpoint called');
  const isConnected = db.isConnected();
  const dbStatus = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const statusText = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbStatus] || 'unknown';
  
  console.log(`Health check response: status=OK, database=${statusText}`);
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    database: statusText,
    databaseReady: isConnected
  });
};

app.get('/health', healthCheck);
app.get('/api/health', healthCheck);

// Temporary endpoint to test MongoDB connection and log connection details
app.get('/api/test-db-connection', async (req, res) => {
  console.log('Testing MongoDB connection...');
  
  try {
    const success = await db.connect(1, 0); // Single attempt, no delay
    if (success) {
      res.json({ 
        status: 'success', 
        message: 'MongoDB connection successful',
        connectionState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        port: mongoose.connection.port
      });
    } else {
      res.json({ 
        status: 'failed', 
        message: 'MongoDB connection failed - check MongoDB Atlas Access History for the IP address that attempted to connect',
        connectionState: mongoose.connection.readyState
      });
    }
  } catch (error) {
    res.json({ 
      status: 'error', 
      message: error.message,
      error: error.name,
      connectionState: mongoose.connection.readyState
    });
  }
});

// Error handling middleware (should be last)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server with error handling
let server;
try {
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    const mongoUri = process.env.MONGO_URL || process.env.MONGODB_URI;
    console.log(`MongoDB URI: ${mongoUri ? 'Set' : 'Not set'} (${process.env.MONGO_URL ? 'Railway integration' : 'manual'})`);
    console.log(`Server started successfully at http://0.0.0.0:${PORT}`);
    console.log(`Cloudflare Tunnel should route api.theabugida.org to this server`);
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit, let the server continue running
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit, let the server continue running
});

// Graceful shutdown handlers
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  // Stop accepting new requests
  if (server) {
    server.close(() => {
      console.log('HTTP server closed');
    });
  }
  
  // Close database connection
  await db.disconnect();
  
  // Exit process
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;

