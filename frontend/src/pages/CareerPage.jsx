import { useState, useEffect, useRef } from 'react'
import Sidebar from '../components/shared/Sidebar'
import { generateLearningPath, generateCareerSuggestions, getSavedCareer } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/shared/Loader'

export default function CareerPage() {
  const { user } = useAuth()
  const [skills, setSkills]             = useState('')
  const [interests, setInterests]       = useState('')
  const [learningPath, setLearningPath] = useState('')
  const [suggestions, setSuggestions]   = useState('')
  const [careerMatches, setCareerMatches] = useState([])  // ✅ store matches for dashboard
  const [loading, setLoading]           = useState(false)
  const [tab, setTab]                   = useState('path')
  const [fetching, setFetching]         = useState(true)
  const [error, setError]               = useState('')

  // ✅ FIX: prevent double API calls
  const isCallingRef = useRef(false)

  useEffect(() => {
    getSavedCareer()
      .then(res => {
        setLearningPath(res.data.learningPath || '')
        // ✅ FIX: was setting raw object — now correctly reads the string field
        setSuggestions(res.data.careerSuggestions || '')
        setCareerMatches(res.data.careerMatches || [])
        setSkills(res.data.skills?.join(', ') || '')
      })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [])

  const handleGeneratePath = async () => {
    if (isCallingRef.current || loading) return   // ✅ prevent double call
    isCallingRef.current = true
    setLoading(true)
    setError('')
    try {
      const res = await generateLearningPath({
        goal: user?.goal || 'Full-stack Developer',
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      })
      // ✅ FIX: explicitly read .learningPath string from response
      setLearningPath(res.data.learningPath || '')
    } catch (err) {
      const msg = err.response?.data?.message || 'AI request failed. Check your API key and billing.'
      setError(msg)
    } finally {
      setLoading(false)
      isCallingRef.current = false
    }
  }

  const handleGenerateSuggestions = async () => {
    if (isCallingRef.current || loading) return   // ✅ prevent double call
    isCallingRef.current = true
    setLoading(true)
    setError('')
    try {
      const res = await generateCareerSuggestions({
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        interests,
      })
      // ✅ FIX: was `res.data` (whole object) — now correctly reads the string field
      setSuggestions(res.data.careerSuggestions || '')
      // ✅ also store careerMatches so dashboard shows them on next visit
      setCareerMatches(res.data.careerMatches || [])
    } catch (err) {
      const msg = err.response?.data?.message || 'AI request failed. Check your API key and billing.'
      setError(msg)
    } finally {
      setLoading(false)
      isCallingRef.current = false
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-lg font-medium text-slate-900 mb-1">AI Career Guide</h1>
        <p className="text-sm text-slate-500 mb-5">Get personalized learning paths and career suggestions</p>

        {/* ── Error banner ── */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
            <span>⚠️</span>
            <div>
              <strong>Error: </strong>{error}
              <div className="mt-1 text-red-500 text-xs">
                Check your Groq API key in your .env file.
              </div>
            </div>
          </div>
        )}

        {/* ── Skills & interests form ── */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 mb-5">
          <h2 className="text-sm font-medium text-slate-700 mb-3">Your skills & interests</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Current skills (comma separated)</label>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                placeholder="React, Node.js, MongoDB..."
                value={skills}
                onChange={e => setSkills(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Interests</label>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                placeholder="Web development, AI, Startups..."
                value={interests}
                onChange={e => setInterests(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => { setTab('path'); setError('') }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'path'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Learning path
          </button>
          <button
            onClick={() => { setTab('career'); setError('') }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'career'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Career suggestions
          </button>
        </div>

        {/* ── Tab content ── */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          {tab === 'path' ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-medium text-slate-700">
                    Learning path for:{' '}
                    <span className="text-blue-600">{user?.goal || 'your goal'}</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {user?.goal ? '' : 'Set your goal in Profile to personalize this'}
                  </p>
                </div>
                <button
                  onClick={handleGeneratePath}
                  disabled={loading}
                  className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Generating...' : '✨ Generate path'}
                </button>
              </div>

              {fetching ? (
                <Loader />
              ) : learningPath ? (
                <pre className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
                  {learningPath}
                </pre>
              ) : (
                <div className="text-center py-10">
                  <div className="text-3xl mb-2">🗺️</div>
                  <p className="text-sm text-slate-400">
                    Click "Generate path" to get your personalized roadmap.
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-slate-700">
                  Career suggestions based on your skills
                </h2>
                <button
                  onClick={handleGenerateSuggestions}
                  disabled={loading}
                  className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Generating...' : '✨ Get suggestions'}
                </button>
              </div>

              {fetching ? (
                <Loader />
              ) : suggestions ? (
                <>
                  {/* ✅ Properly rendered suggestion text */}
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-sans mb-5">
                    {suggestions}
                  </pre>

                  {/* ✅ Career match cards — shown when available */}
                  {careerMatches.length > 0 && (
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                        Your top career matches
                      </h3>
                      <div className="flex flex-col gap-2">
                        {careerMatches.map((c, i) => (
                          <div
                            key={c.title}
                            className="flex items-center justify-between px-4 py-3 rounded-lg border"
                            style={{
                              background: i === 0 ? 'rgba(79,142,247,0.05)' : '#f8fafc',
                              borderColor: i === 0 ? 'rgba(79,142,247,0.25)' : '#e2e8f0',
                            }}
                          >
                            <div>
                              <div className="text-sm font-semibold text-slate-800">{c.title}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{c.sub}</div>
                            </div>
                            <div
                              className="text-sm font-bold font-mono"
                              style={{ color: i === 0 ? '#10b981' : i === 1 ? '#4f8ef7' : '#94a3b8' }}
                            >
                              {c.pct}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-10">
                  <div className="text-3xl mb-2">🎯</div>
                  <p className="text-sm text-slate-400">
                    Enter your skills above and click "Get suggestions".
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}