const mongoose = require('mongoose');

const careerSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  goal: {
    type: String,
    required: true,
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
  generatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Career', careerSchema);