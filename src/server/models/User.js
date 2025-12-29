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
  // User preferences
  themeMode: {
    type: String,
    enum: ['auto', 'light', 'dark'],
    default: 'auto',
  },
  // User progress tracking
  progress: {
    // Track completed sections: { topicKey: { section: { page: completionStatus } } }
    // Example: { "letters": { "Learn": { "1": true, "2": true }, "Quiz": { "1": { score: 85, completed: true } } } }
    completedSections: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Track quiz scores: { topicKey: { section: { page: score } } }
    quizScores: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Overall statistics
    stats: {
      totalLessonsCompleted: { type: Number, default: 0 },
      totalQuizzesCompleted: { type: Number, default: 0 },
      averageQuizScore: { type: Number, default: 0 },
      lastActivity: { type: Date, default: Date.now },
    },
  },
});

module.exports = mongoose.model('User', userSchema);

