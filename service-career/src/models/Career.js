const mongoose = require('mongoose');

const careerSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  goal: {
    type: String,
    default: '',      // ← was "required: true" — this was silently breaking /suggest upserts
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

  // ── NEW: skill progress bars for Dashboard ──────────────────
  // Populated when user generates a learning path
  // e.g. [{ name: "React", pct: 72 }, { name: "Node.js", pct: 45 }]
  skillProgress: {
    type: [{ name: String, pct: Number }],
    default: [],
  },

  // ── NEW: career match cards for Dashboard ───────────────────
  // Populated when user generates career suggestions
  // e.g. [{ title: "Full-stack Developer", sub: "Best match", pct: 87 }]
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