const Groq = require('groq-sdk')
const Career = require('../models/Career')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

function extractJSON(raw) {
  let text = raw
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim()

  if (text.startsWith('"') && text.endsWith('"')) {
    try { text = JSON.parse(text) } catch (_) {}
  }

  const start = text.indexOf('{')
  const end   = text.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object found')
  text = text.slice(start, end + 1)

  const parsed = JSON.parse(text)

  if (typeof parsed.learningPath === 'string') {
    const lp = parsed.learningPath.trim()
    if (lp.startsWith('{')) {
      try {
        const inner = JSON.parse(lp)
        if (inner.learningPath)  parsed.learningPath  = inner.learningPath
        if (inner.skillProgress) parsed.skillProgress = inner.skillProgress
      } catch (_) {}
    }
  }

  if (Array.isArray(parsed.skillProgress)) {
    parsed.skillProgress = parsed.skillProgress.map(item => ({
      name: String(item.name || ''),
      pct:  Number(item.pct  || 0),
    }))
  }

  return parsed
}

// ─── Generate Learning Path ───────────────────────────────────────────────────
const generateLearningPath = async (req, res) => {
  const { goal, skills } = req.body
  const skillList = Array.isArray(skills) ? skills : []

  if (!goal) return res.status(400).json({ message: 'Goal is required' })

  try {
    const prompt = `You are a career advisor. Return ONLY raw JSON, no markdown, no explanation.

Output this exact structure:
{
  "learningPath": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "skillProgress": [
    {"name": "JavaScript", "pct": 70},
    {"name": "React", "pct": 50},
    {"name": "Node.js", "pct": 30}
  ]
}

Goal: ${goal}
Current skills: ${skillList.length ? skillList.join(', ') : 'none listed'}

Rules:
- learningPath must be an array of strings, each representing a step
- skillProgress must be an array of 4-6 objects with "name" (string) and "pct" (integer 0-100)
- Include provided skills with realistic proficiency + 2-3 skills they need to learn at pct 10-20
- Output ONLY the JSON object above, nothing else`

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.3,
    })

    const raw = response.choices[0].message.content
    console.log('──── Groq raw (learning-path) ────')
    console.log(raw)
    console.log('──────────────────────────────────')

    let parsed
    try {
      parsed = extractJSON(raw)
    } catch (parseErr) {
      console.error('JSON parse failed:', parseErr.message)
      parsed = {
        learningPath: raw,
        skillProgress: skillList.map((s, i) => ({ name: s, pct: Math.max(10, 70 - i * 15) })),
      }
    }

    const learningPath = Array.isArray(parsed.learningPath)
      ? parsed.learningPath.join('\n')
      : (parsed.learningPath || raw)
    const skillProgress =
      Array.isArray(parsed.skillProgress) && parsed.skillProgress.length > 0
        ? parsed.skillProgress
        : skillList.map((s, i) => ({ name: s, pct: Math.max(10, 70 - i * 15) }))

    console.log('✅ Saving skillProgress:', JSON.stringify(skillProgress))

    await Career.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { goal, skills: skillList, learningPath, skillProgress, generatedAt: Date.now() } },
      { upsert: true, new: true }
    )

    res.json({ learningPath })

  } catch (err) {
    console.error('Groq /learning-path error:', err.message)
    if (err.status === 401) return res.status(500).json({ message: 'Invalid Groq API key.' })
    if (err.status === 429) return res.status(500).json({ message: 'Groq rate limit hit. Wait and retry.' })
    res.status(500).json({ message: 'AI error', error: err.message })
  }
}

// ─── Generate Career Suggestions ─────────────────────────────────────────────
const generateCareerSuggestions = async (req, res) => {
  const { skills, interests } = req.body
  const skillList = Array.isArray(skills) ? skills : []

  try {
    const prompt = `You are a career counselor. Return ONLY raw JSON, no markdown, no explanation.

Output this exact structure:
{
  "careerSuggestions": [
    "Career 1: ...",
    "Career 2: ...",
    "Career 3: ..."
  ],
  "careerMatches": [
    {"title": "Job Title", "sub": "Short reason", "pct": 85},
    {"title": "Job Title", "sub": "Short reason", "pct": 74},
    {"title": "Job Title", "sub": "Short reason", "pct": 60}
  ]
}

Skills: ${skillList.length ? skillList.join(', ') : 'not specified'}
Interests: ${interests || 'not specified'}

Rules:
- careerSuggestions: an array of strings, each describing a career path
- careerMatches: exactly 3 objects sorted by pct descending
- pct must be an integer number, not a string
- Output ONLY the JSON object above, nothing else`

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 900,
      temperature: 0.3,
    })

    const raw = response.choices[0].message.content
    console.log('──── Groq raw (suggest) ────')
    console.log(raw)
    console.log('────────────────────────────')

    let parsed
    try {
      parsed = extractJSON(raw)
    } catch (parseErr) {
      console.error('JSON parse failed:', parseErr.message)
      parsed = { careerSuggestions: raw, careerMatches: [] }
    }

    const careerSuggestions = Array.isArray(parsed.careerSuggestions)
      ? parsed.careerSuggestions.join('\n\n')
      : (parsed.careerSuggestions || raw)
    const careerMatches = Array.isArray(parsed.careerMatches) ? parsed.careerMatches : []

    console.log('✅ Saving careerMatches:', JSON.stringify(careerMatches))

    await Career.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { careerSuggestions, careerMatches } },
      { upsert: true, new: true }
    )

    res.json({ careerSuggestions })

  } catch (err) {
    console.error('Groq /suggest error:', err.message)
    if (err.status === 401) return res.status(500).json({ message: 'Invalid Groq API key.' })
    if (err.status === 429) return res.status(500).json({ message: 'Groq rate limit hit. Wait and retry.' })
    res.status(500).json({ message: 'AI error', error: err.message })
  }
}

// ─── Get Saved Career ─────────────────────────────────────────────────────────
const getSavedCareer = async (req, res) => {
  try {
    const data = await Career.findOne({ userId: req.user.id })

    if (!data) {
      return res.json({
        learningPath: '', careerSuggestions: '',
        skills: [], skillProgress: [], careerMatches: [], goal: '',
      })
    }

    res.json({
      learningPath:      data.learningPath      || '',
      careerSuggestions: data.careerSuggestions || '',
      skills:            data.skills            || [],
      skillProgress:     data.skillProgress     || [],
      careerMatches:     data.careerMatches     || [],
      goal:              data.goal              || '',
    })

  } catch (err) {
    console.error('getSavedCareer error:', err.message)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { generateLearningPath, generateCareerSuggestions, getSavedCareer }