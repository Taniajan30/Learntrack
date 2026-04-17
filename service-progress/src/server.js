const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const progressRoutes = require('./routes/progressRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Progress DB connected'))
  .catch((err) => console.log('DB error:', err));

app.use('/api/progress', progressRoutes);

app.get('/', (req, res) => {
  res.json({ service: 'progress-service', status: 'running', port: process.env.PORT });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Progress service running on port ${PORT}`));