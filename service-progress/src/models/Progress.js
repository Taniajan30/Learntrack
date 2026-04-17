const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  dsaSolved: {
    type: Number,
    default: 0,
  },
  hoursStudied: {
    type: Number,
    default: 0,
  },
  topic: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);