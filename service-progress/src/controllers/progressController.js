const Progress = require('../models/Progress');

const addProgress = async (req, res) => {
  const { date, dsaSolved, hoursStudied, topic, notes } = req.body;

  try {
    const existing = await Progress.findOne({ userId: req.user.id, date });

    if (existing) {
      existing.dsaSolved += dsaSolved || 0;
      existing.hoursStudied += hoursStudied || 0;
      existing.topic = topic || existing.topic;
      existing.notes = notes || existing.notes;
      await existing.save();
      return res.json(existing);
    }

    const progress = await Progress.create({
      userId: req.user.id,
      date,
      dsaSolved,
      hoursStudied,
      topic,
      notes,
    });

    res.status(201).json(progress);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getMyProgress = async (req, res) => {
  try {
    const logs = await Progress.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getWeeklyProgress = async (req, res) => {
  try {
    const today = new Date();
    const last7 = new Date(today);
    last7.setDate(today.getDate() - 6);

    const formatDate = (d) => d.toISOString().split('T')[0];

    const logs = await Progress.find({
      userId: req.user.id,
      date: { $gte: formatDate(last7), $lte: formatDate(today) },
    }).sort({ date: 1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getStats = async (req, res) => {
  try {
    const logs = await Progress.find({ userId: req.user.id });

    const totalDSA = logs.reduce((sum, l) => sum + (l.dsaSolved || 0), 0);
    const totalHours = logs.reduce((sum, l) => sum + (l.hoursStudied || 0), 0);
    const totalDays = logs.length;

    res.json({ totalDSA, totalHours, totalDays });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteProgress = async (req, res) => {
  try {
    await Progress.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { addProgress, getMyProgress, getWeeklyProgress, getStats, deleteProgress };