const OpenAI = require('openai');
const Career = require('../models/Career');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const generateLearningPath = async (req, res) => {
  const { goal, skills } = req.body;

  try {
    const prompt = `
You are a career advisor for students.
The student's goal is: "${goal}"
Their current skills are: ${skills.join(', ') || 'none mentioned'}

Please provide:
1. A step-by-step learning path (beginner to advanced) with 5-7 steps
2. Key skills to learn at each step
3. Estimated time for each step

Keep it practical, simple, and motivating for a college student.
Format it clearly with numbered steps.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
    });

    const learningPath = response.choices[0].message.content;

    const saved = await Career.findOneAndUpdate(
      { userId: req.user.id },
      { userId: req.user.id, goal, skills, learningPath, generatedAt: Date.now() },
      { upsert: true, new: true }
    );

    res.json({ learningPath, saved });
  } catch (err) {
    res.status(500).json({ message: 'AI error', error: err.message });
  }
};

const generateCareerSuggestions = async (req, res) => {
  const { skills, interests } = req.body;

  try {
    const prompt = `
You are a career counselor.
A student has these skills: ${skills.join(', ')}
Their interests are: ${interests || 'not specified'}

Suggest 3-5 suitable career paths for them. For each:
- Career title
- Why it matches their skills
- Average salary range
- Top companies hiring

Keep it brief and encouraging for a college student.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 700,
    });

    const careerSuggestions = response.choices[0].message.content;

    await Career.findOneAndUpdate(
      { userId: req.user.id },
      { careerSuggestions },
      { upsert: true, new: true }
    );

    res.json({ careerSuggestions });
  } catch (err) {
    res.status(500).json({ message: 'AI error', error: err.message });
  }
};

const getSavedCareer = async (req, res) => {
  try {
    const data = await Career.findOne({ userId: req.user.id });
    if (!data) return res.status(404).json({ message: 'No career data found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { generateLearningPath, generateCareerSuggestions, getSavedCareer };