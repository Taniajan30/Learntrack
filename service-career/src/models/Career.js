const mongoose = require('mongoose');

const careerSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  goal: {
    type: String,
    default: '',      
  },
  skills: {
    type: [String],
    default: [],
  },
  learningPath: {
    type: String,
    default: '',
  },
  careerSuggestions: {
    type: String,
    default: '',
  },

  skillProgress: {
    type: [{ name: String, pct: Number }],
    default: [],
  },

  careerMatches: {
    type: [{ title: String, sub: String, pct: Number }],
    default: [],
  },

  generatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Career', careerSchema);