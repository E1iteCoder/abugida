const mongoose = require('mongoose');

const connect = async (retries = 5, delay = 5000) => {
  const mongoURI = process.env.MONGODB_URI;
  
  if (!mongoURI) {
    console.error('MONGODB_URI environment variable is not set!');
    console.error('Please set MONGODB_URI in your .env file or environment variables.');
    console.error('Server will continue to run, but database operations will fail.');
    return false;
  }
  
  for (let i = 0; i < retries; i++) {
    try {
      // Remove deprecated options - they're not needed in Mongoose 6+
      await mongoose.connect(mongoURI);
      
      console.log('MongoDB connected successfully');
      return true;
    } catch (error) {
      console.error(`MongoDB connection attempt ${i + 1}/${retries} failed:`, error.message);
      
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
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

module.exports = { connect };

