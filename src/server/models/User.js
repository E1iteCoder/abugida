const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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

