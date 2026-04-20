const Groq = require('groq-sdk')
const Career = require('../models/Career')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

function parseGroqJSON(text) {
  // 1. Strip markdown fences
  let cleaned = text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim()

  const start = cleaned.indexOf('{')
  const end   = cleaned.lastIndexOf('}')
  if (start !== -1 && end !== -1) {
    cleaned = cleaned.slice(start, end + 1)
  }

  const parsed = JSON.parse(cleaned)

  if (typeof parsed.learningPath === 'string' && parsed.learningPath.trim().startsWith('{')) {
    try {
      const inner = JSON.parse(parsed.learningPath)
      if (inner.learningPath)   parsed.learningPath  = inner.learningPath
      if (inner.skillProgress)  parsed.skillProgress = inner.skillProgress
    } catch (_) { /* not double-encoded, keep as-is */ }
  }

  return parsed
}

const generateLearningPath = async (req, res) => {
  const { goal, skills } = req.body
  const skillList = Array.isArray(skills) ? skills : []

  if (!goal) {
    return res.status(400).json({ message: 'Goal is required' })
  }

  try {
    const prompt = `You are a career advisor. You must respond with ONLY a JSON object, nothing else.

Goal: ${goal}
Current skills: ${skillList.length ? skillList.join(', ') : 'none'}

Respond with exactly this JSON structure and nothing else:
{"learningPath":"step 1: ... step 2: ... (use actual newlines between steps)","skillProgress":[{"name":"skill name","pct":50}]}

Rules:
- learningPath: 5-7 numbered steps as a plain string, use real newline characters between steps
- skillProgress: array of objects, each with "name" (string) and "pct" (number 0-100)
- Include current skills with estimated proficiency, add 2-3 missing skills with pct 5-15
- Maximum 6 items in skillProgress
- pct must be a NUMBER not a string
- Return ONLY the JSON, no explanation, no markdown`

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
    })

    const raw = response.choices[0].message.content
    console.log('Groq raw response (learning-path):', raw) // ← shows in terminal for debugging

    let parsed
    try {
      parsed = parseGroqJSON(raw)
    } catch (parseErr) {
      console.error('JSON parse failed:', parseErr.message, '| raw was:', raw)
      parsed = { learningPath: raw, skillProgress: [] }
    }

    const learningPath  = parsed.learningPath  || raw
    const skillProgress = Array.isArray(parsed.skillProgress) ? parsed.skillProgress : []

    console.log('Saving skillProgress:', skillProgress) // ← confirm what gets saved

    await Career.findOneAndUpdate(
      { userId: req.user.id },
      {
        userId: req.user.id,
        goal,
        skills: skillList,
        learningPath,
        skillProgress,
        generatedAt: Date.now(),
      },
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

const generateCareerSuggestions = async (req, res) => {
  const { skills, interests } = req.body
  const skillList = Array.isArray(skills) ? skills : []

  try {
    const prompt = `You are a career counselor. You must respond with ONLY a JSON object, nothing else.

Skills: ${skillList.length ? skillList.join(', ') : 'not specified'}
Interests: ${interests || 'not specified'}

Respond with exactly this JSON structure and nothing else:
{"careerSuggestions":"career 1: ... career 2: ... career 3: ...","careerMatches":[{"title":"Job Title","sub":"Short reason","pct":85}]}

Rules:
- careerSuggestions: detailed text about 3 career paths as a plain string
- careerMatches: exactly 3 objects sorted highest pct first
- Each object has "title" (string), "sub" (max 5 words), "pct" (number 0-100)
- pct must be a NUMBER not a string
- Return ONLY the JSON, no explanation, no markdown`

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 900,
    })

    const raw = response.choices[0].message.content
    console.log('Groq raw response (suggest):', raw) // ← shows in terminal for debugging

    let parsed
    try {
      parsed = parseGroqJSON(raw)
    } catch (parseErr) {
      console.error('JSON parse failed:', parseErr.message, '| raw was:', raw)
      parsed = { careerSuggestions: raw, careerMatches: [] }
    }

    const careerSuggestions = parsed.careerSuggestions || raw
    const careerMatches     = Array.isArray(parsed.careerMatches) ? parsed.careerMatches : []

    console.log('Saving careerMatches:', careerMatches) // ← confirm what gets saved

    await Career.findOneAndUpdate(
      { userId: req.user.id },
      { careerSuggestions, careerMatches },
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

const getSavedCareer = async (req, res) => {
  try {
    const data = await Career.findOne({ userId: req.user.id })

    if (!data) {
      return res.json({
        learningPath:      '',
        careerSuggestions: '',
        skills:            [],
        skillProgress:     [],
        careerMatches:     [],
        goal:              '',
      })
    }

    res.json({
      learningPath:      data.learningPath      || '',
      careerSuggestions: data.careerSuggestions || '',
      skills:            data.skills            || [],
      skillProgress:     data.skillProgress     || [],
      careerMatches:     data.careerMatches      || [],
      goal:              data.goal              || '',
    })

  } catch (err) {
    console.error('getSavedCareer error:', err.message)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { generateLearningPath, generateCareerSuggestions, getSavedCareer }