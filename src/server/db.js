const mongoose = require('mongoose');

// Connection options for better reliability
const connectionOptions = {
  serverSelectionTimeoutMS: 30000, // Timeout after 30s (increased for SSL handshake)
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  connectTimeoutMS: 30000, // Give up initial connection after 30s (increased for SSL handshake)
  maxPoolSize: 10, // Maintain up to 10 socket connections
  minPoolSize: 2, // Maintain at least 2 socket connections
  // TLS/SSL options for MongoDB Atlas
  tls: true, // Enable TLS (required for Atlas)
  tlsAllowInvalidCertificates: false, // Validate certificates
  tlsAllowInvalidHostnames: false, // Validate hostnames
};

// Internal connection function (without background retry)
const _connect = async (retries = 5, delay = 5000) => {
  const mongoURI = process.env.MONGODB_URI;
  
  if (!mongoURI) {
    console.error('MONGODB_URI environment variable is not set!');
    console.error('Please set MONGODB_URI in your .env file or environment variables.');
    console.error('Server will continue to run, but database operations will fail.');
    return false;
  }
  
  // Prevent multiple connection attempts
  if (mongoose.connection.readyState === 1) {
    console.log('MongoDB already connected');
    return true;
  }
  
  // Prevent connecting if already connecting
  if (mongoose.connection.readyState === 2) {
    console.log('MongoDB connection already in progress');
    return false;
  }
  
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(mongoURI, connectionOptions);
      
      console.log('MongoDB connected successfully');
      console.log(`Database: ${mongoose.connection.name}`);
      console.log(`Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
      return true;
    } catch (error) {
      console.error(`MongoDB connection attempt ${i + 1}/${retries} failed:`, error.message);
      
      // Log more details for debugging
      if (error.name === 'MongoServerSelectionError') {
        console.error('Server selection error - check network connectivity and MongoDB Atlas IP whitelist');
        if (error.cause && error.cause.code === 'ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR') {
          console.error('SSL/TLS handshake error - this may indicate:');
          console.error('  1. IP address not whitelisted in MongoDB Atlas');
          console.error('  2. Network connectivity issues from Railway to MongoDB Atlas');
          console.error('  3. TLS version compatibility issues');
        }
      } else if (error.name === 'MongoParseError') {
        console.error('Connection string parse error - check MONGODB_URI format');
      } else if (error.name === 'MongoAuthenticationError') {
        console.error('Authentication error - check username and password in MONGODB_URI');
      } else if (error.cause && error.cause.code === 'ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR') {
        console.error('SSL/TLS handshake error detected');
        console.error('This often indicates IP whitelist issues in MongoDB Atlas');
        console.error('Check MongoDB Atlas Network Access settings');
      }
      
      // Close any partial connection to reset state
      if (mongoose.connection.readyState !== 0) {
        try {
          await mongoose.connection.close();
        } catch (closeError) {
          // Ignore close errors
        }
      }
      
      if (i < retries - 1) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('MongoDB connection failed after all retries');
        console.error('Server will continue to run, but database operations will fail.');
        console.error('Will retry in background every 30 seconds...');
        return false;
      }
    }
  }
  
  return false;
};

// Background retry mechanism
let retryInterval = null;

const startBackgroundRetry = () => {
  if (retryInterval) {
    return; // Already retrying
  }
  
  console.log('Starting background MongoDB connection retry (every 30 seconds)...');
  retryInterval = setInterval(async () => {
    // Only retry if not connected and not currently connecting
    if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
      console.log('Retrying MongoDB connection in background...');
      const success = await _connect(1, 0); // Single attempt, no delay
      if (success && retryInterval) {
        clearInterval(retryInterval);
        retryInterval = null;
        console.log('Background retry successful! MongoDB is now connected.');
      }
    } else if (mongoose.connection.readyState === 1) {
      // Already connected, stop retrying
      if (retryInterval) {
        clearInterval(retryInterval);
        retryInterval = null;
      }
    }
  }, 30000); // Retry every 30 seconds
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('MongoDB connection event: connected');
  // Stop background retry if it's running
  if (retryInterval) {
    clearInterval(retryInterval);
    retryInterval = null;
    console.log('Background retry stopped - MongoDB is now connected');
  }
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB connection event: disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection event: error', err);
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB connection event: reconnected');
});

// Helper function to check if database is ready
const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Graceful shutdown function
const disconnect = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed gracefully');
    }
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
};

// Public connect function that also starts background retry on failure
const connect = async (retries = 5, delay = 5000) => {
  const success = await _connect(retries, delay);
  if (!success) {
    startBackgroundRetry();
  }
  return success;
};

module.exports = { connect, isConnected, disconnect };

