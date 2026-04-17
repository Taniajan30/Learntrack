const express = require('express');
const router = express.Router();
const {
  addProgress,
  getMyProgress,
  getWeeklyProgress,
  getStats,
  deleteProgress,
} = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addProgress);
router.get('/', protect, getMyProgress);
router.get('/weekly', protect, getWeeklyProgress);
router.get('/stats', protect, getStats);
router.delete('/:id', protect, deleteProgress);

module.exports = router;