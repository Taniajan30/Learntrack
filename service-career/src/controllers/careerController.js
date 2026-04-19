// const Groq = require('groq-sdk')
// const Career = require('../models/Career')

// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// /* ─────────────────────────────────────────────────────────────
//    HELPER — safely parse JSON that Groq returns
//    Groq sometimes wraps JSON in ```json ... ``` fences, so we
//    strip those before parsing.
// ───────────────────────────────────────────────────────────── */
// function parseGroqJSON(text) {
//   const cleaned = text
//     .replace(/```json/gi, '')
//     .replace(/```/g, '')
//     .trim()
//   return JSON.parse(cleaned)
// }

// /* ─────────────────────────────────────────────────────────────
//    POST /api/career/learning-path
//    — asks Groq to return structured JSON with learningPath text
//      AND a skillProgress array
//    — saves both to DB
//    — returns { learningPath } to frontend (CareerPage shows text)
//    — Dashboard reads skillProgress from /saved
// ───────────────────────────────────────────────────────────── */
// const generateLearningPath = async (req, res) => {
//   const { goal, skills } = req.body
//   const skillList = Array.isArray(skills) ? skills : []

//   if (!goal) {
//     return res.status(400).json({ message: 'Goal is required' })
//   }

//   try {
//     const prompt = `
// You are a career advisor for college students.
// The student's goal is: "${goal}"
// Their current skills are: ${skillList.length ? skillList.join(', ') : 'none mentioned'}

// Return ONLY a valid JSON object — no markdown, no explanation, no extra text.
// Use this exact shape:

// {
//   "learningPath": "A step-by-step roadmap with 5-7 numbered steps. Each step on a new line starting with the step number. Include key skills and estimated time per step.",
//   "skillProgress": [
//     { "name": "skill name", "pct": estimated_proficiency_number_0_to_100 }
//   ]
// }

// Rules for skillProgress:
// - Include the skills the student already listed, estimate their current proficiency (0-100)
// - Add 2-3 important missing skills for their goal with pct of 0-15 (they haven't learned them yet)
// - Maximum 6 skills total
// - pct must be a plain number, not a string
// `.trim()

//     const response = await groq.chat.completions.create({
//       model: 'llama-3.3-70b-versatile',
//       messages: [{ role: 'user', content: prompt }],
//       max_tokens: 1000,
//     })

//     const raw = response.choices[0].message.content

//     // Parse the structured JSON from Groq
//     let parsed
//     try {
//       parsed = parseGroqJSON(raw)
//     } catch (parseErr) {
//       // If Groq didn't return valid JSON despite instructions, fall back gracefully
//       console.error('JSON parse failed, saving raw text only:', parseErr.message)
//       parsed = { learningPath: raw, skillProgress: [] }
//     }

//     const learningPath   = parsed.learningPath   || raw
//     const skillProgress  = Array.isArray(parsed.skillProgress) ? parsed.skillProgress : []

//     // Save to DB — upsert so one document per user
//     await Career.findOneAndUpdate(
//       { userId: req.user.id },
//       {
//         userId: req.user.id,
//         goal,
//         skills: skillList,
//         learningPath,
//         skillProgress,      // ← saved to DB, Dashboard reads this
//         generatedAt: Date.now(),
//       },
//       { upsert: true, new: true }
//     )

//     // Return only learningPath text — CareerPage.jsx uses this
//     res.json({ learningPath })

//   } catch (err) {
//     console.error('Groq /learning-path error:', err.message)
//     if (err.status === 401) return res.status(500).json({ message: 'Invalid Groq API key. Check it at console.groq.com' })
//     if (err.status === 429) return res.status(500).json({ message: 'Groq rate limit hit. Wait a moment and try again.' })
//     res.status(500).json({ message: 'AI error', error: err.message })
//   }
// }

// /* ─────────────────────────────────────────────────────────────
//    POST /api/career/suggest
//    — asks Groq to return structured JSON with careerSuggestions
//      text AND a careerMatches array
//    — saves both to DB
//    — returns { careerSuggestions } to frontend
//    — Dashboard reads careerMatches from /saved
// ───────────────────────────────────────────────────────────── */
// const generateCareerSuggestions = async (req, res) => {
//   const { skills, interests } = req.body
//   const skillList = Array.isArray(skills) ? skills : []

//   try {
//     const prompt = `
// You are a career counselor for college students.
// The student's skills are: ${skillList.length ? skillList.join(', ') : 'not specified'}
// Their interests are: ${interests || 'not specified'}

// Return ONLY a valid JSON object — no markdown, no explanation, no extra text.
// Use this exact shape:

// {
//   "careerSuggestions": "A detailed multi-line string with 3 career paths. For each: title, why it matches, salary range, top companies. Use \\n for line breaks.",
//   "careerMatches": [
//     { "title": "Job Title", "sub": "One sentence reason it matches", "pct": match_score_0_to_100 }
//   ]
// }

// Rules for careerMatches:
// - Exactly 3 items
// - Sorted highest pct to lowest
// - pct must be a plain number, not a string
// - sub must be a short sentence (max 6 words)
// `.trim()

//     const response = await groq.chat.completions.create({
//       model: 'llama-3.3-70b-versatile',
//       messages: [{ role: 'user', content: prompt }],
//       max_tokens: 900,
//     })

//     const raw = response.choices[0].message.content

//     let parsed
//     try {
//       parsed = parseGroqJSON(raw)
//     } catch (parseErr) {
//       console.error('JSON parse failed, saving raw text only:', parseErr.message)
//       parsed = { careerSuggestions: raw, careerMatches: [] }
//     }

//     const careerSuggestions = parsed.careerSuggestions || raw
//     const careerMatches     = Array.isArray(parsed.careerMatches) ? parsed.careerMatches : []

//     // Update only careerSuggestions + careerMatches — keep learningPath intact
//     await Career.findOneAndUpdate(
//       { userId: req.user.id },
//       {
//         careerSuggestions,
//         careerMatches,      // ← saved to DB, Dashboard reads this
//       },
//       { upsert: true, new: true }
//     )

//     // Return only careerSuggestions text — CareerPage.jsx uses this
//     res.json({ careerSuggestions })

//   } catch (err) {
//     console.error('Groq /suggest error:', err.message)
//     if (err.status === 401) return res.status(500).json({ message: 'Invalid Groq API key. Check it at console.groq.com' })
//     if (err.status === 429) return res.status(500).json({ message: 'Groq rate limit hit. Wait a moment and try again.' })
//     res.status(500).json({ message: 'AI error', error: err.message })
//   }
// }

// /* ─────────────────────────────────────────────────────────────
//    GET /api/career/saved
//    — used by BOTH CareerPage (loads saved text on mount)
//      AND DashboardPage (loads skillProgress + careerMatches)
//    — always returns 200, never 404
// ───────────────────────────────────────────────────────────── */
// const getSavedCareer = async (req, res) => {
//   try {
//     const data = await Career.findOne({ userId: req.user.id })

//     if (!data) {
//       // New user — return empty shape so frontend doesn't crash
//       return res.json({
//         learningPath:      '',
//         careerSuggestions: '',
//         skills:            [],
//         skillProgress:     [],
//         careerMatches:     [],
//         goal:              '',
//       })
//     }

//     res.json({
//       learningPath:      data.learningPath      || '',
//       careerSuggestions: data.careerSuggestions || '',
//       skills:            data.skills            || [],
//       skillProgress:     data.skillProgress     || [],
//       careerMatches:     data.careerMatches      || [],
//       goal:              data.goal              || '',
//     })

//   } catch (err) {
//     console.error('getSavedCareer error:', err.message)
//     res.status(500).json({ message: 'Server error', error: err.message })
//   }
// }

// module.exports = { generateLearningPath, generateCareerSuggestions, getSavedCareer }



const Groq = require('groq-sdk')
const Career = require('../models/Career')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

/* ─────────────────────────────────────────────────────────────
   HELPER — safely parse JSON from Groq response
   Handles: markdown fences, text before/after JSON,
   and double-encoded JSON strings
───────────────────────────────────────────────────────────── */
function parseGroqJSON(text) {
  // 1. Strip markdown fences
  let cleaned = text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim()

  // 2. Extract only the JSON object (ignore any text before/after)
  const start = cleaned.indexOf('{')
  const end   = cleaned.lastIndexOf('}')
  if (start !== -1 && end !== -1) {
    cleaned = cleaned.slice(start, end + 1)
  }

  const parsed = JSON.parse(cleaned)

  // 3. Guard: if learningPath is itself a JSON string (double-encoded), unwrap it
  if (typeof parsed.learningPath === 'string' && parsed.learningPath.trim().startsWith('{')) {
    try {
      const inner = JSON.parse(parsed.learningPath)
      if (inner.learningPath)   parsed.learningPath  = inner.learningPath
      if (inner.skillProgress)  parsed.skillProgress = inner.skillProgress
    } catch (_) { /* not double-encoded, keep as-is */ }
  }

  return parsed
}

/* ─────────────────────────────────────────────────────────────
   POST /api/career/learning-path
───────────────────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────────────────
   POST /api/career/suggest
───────────────────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────────────────
   GET /api/career/saved
───────────────────────────────────────────────────────────── */
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