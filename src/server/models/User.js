const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: false, // Optional for backward compatibility with existing users
    unique: true,
    sparse: true, // Allow multiple null values (for existing users without username)
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_]+$/, // Only alphanumeric and underscore
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Add more fields as needed
  // profile: {
  //   name: String,
  //   avatar: String,
  // },
  // progress: {
  //   completedLessons: [String],
  //   quizScores: [Number],
  // },
});

module.exports = mongoose.model('User', userSchema);

