const mongoose = require('mongoose');

const connect = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('MONGODB_URI environment variable is not set!');
      console.error('Please set MONGODB_URI in your .env file or environment variables.');
      console.error('Server will continue to run, but database operations will fail.');
      return false;
    }
    
    // Remove deprecated options - they're not needed in Mongoose 6+
    await mongoose.connect(mongoURI);
    
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.error('Server will continue to run, but database operations will fail.');
    return false;
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

module.exports = { connect };

