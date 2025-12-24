const mongoose = require('mongoose');

// Connection options for better reliability
const connectionOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  connectTimeoutMS: 10000, // Give up initial connection after 10s
  maxPoolSize: 10, // Maintain up to 10 socket connections
  minPoolSize: 2, // Maintain at least 2 socket connections
};

const connect = async (retries = 5, delay = 5000) => {
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
      } else if (error.name === 'MongoParseError') {
        console.error('Connection string parse error - check MONGODB_URI format');
      } else if (error.name === 'MongoAuthenticationError') {
        console.error('Authentication error - check username and password in MONGODB_URI');
      }
      
      if (i < retries - 1) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('MongoDB connection failed after all retries');
        console.error('Server will continue to run, but database operations will fail.');
        return false;
      }
    }
  }
  
  return false;
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('MongoDB connection event: connected');
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

module.exports = { connect, isConnected, disconnect };

