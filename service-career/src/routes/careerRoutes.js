const express = require('express');
const router = express.Router();
const {
  generateLearningPath,
  generateCareerSuggestions,
  getSavedCareer,
} = require('../controllers/careerController');
const { protect } = require('../middleware/authMiddleware');

router.post('/learning-path', protect, generateLearningPath);
router.post('/suggest', protect, generateCareerSuggestions);
router.get('/saved', protect, getSavedCareer);

module.exports = router;