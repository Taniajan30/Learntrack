require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const careerRoutes = require('./routes/careerRoutes');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Career DB connected'))
  .catch((err) => console.log('DB error:', err));

app.use('/api/career', careerRoutes);

app.get('/', (req, res) => {
  res.json({ service: 'career-service', status: 'running', port: process.env.PORT });
});

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => console.log(`Career service running on port ${PORT}`));