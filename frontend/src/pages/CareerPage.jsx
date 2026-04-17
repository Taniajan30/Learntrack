import { useState, useEffect } from 'react'
import Sidebar from '../components/shared/Sidebar'
import { generateLearningPath, generateCareerSuggestions, getSavedCareer } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/shared/Loader'

export default function CareerPage() {
  const { user } = useAuth()
  const [skills, setSkills]           = useState('')
  const [interests, setInterests]     = useState('')
  const [learningPath, setLearningPath] = useState('')
  const [suggestions, setSuggestions] = useState('')
  const [loading, setLoading]         = useState(false)
  const [tab, setTab]                 = useState('path')
  const [fetching, setFetching]       = useState(true)
  const [error, setError]             = useState('')   // ← show AI errors in UI, not alert()

  useEffect(() => {
    getSavedCareer()
      .then(res => {
        // Backend now always returns 200 with empty fields for new users
        setLearningPath(res.data.learningPath || '')
        setSuggestions(res.data.careerSuggestions || '')
        setSkills(res.data.skills?.join(', ') || '')
      })
      .catch(() => {
        // Still silently ignore — user just starts fresh
      })
      .finally(() => setFetching(false))
  }, [])

  const handleGeneratePath = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await generateLearningPath({
        goal: user?.goal || 'Full-stack Developer',
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      })
      setLearningPath(res.data.learningPath)
    } catch (err) {
      // Show the real error message from backend instead of generic alert
      const msg = err.response?.data?.message || 'AI request failed. Check your API key and billing.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateSuggestions = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await generateCareerSuggestions({
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        interests,
      })
      setSuggestions(res.data.careerSuggestions)
    } catch (err) {
      const msg = err.response?.data?.message || 'AI request failed. Check your API key and billing.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-lg font-medium text-slate-900 mb-1">AI Career Guide</h1>
        <p className="text-sm text-slate-500 mb-5">Get personalized learning paths and career suggestions</p>

        {/* ── Error banner — only shows when AI fails ── */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
            <span>⚠️</span>
            <div>
              <strong>Error: </strong>{error}
              <div className="mt-1 text-red-500 text-xs">
                Check your OpenAI API key and billing at{' '}
                <a href="https://platform.openai.com/billing" target="_blank" rel="noreferrer" className="underline">
                  platform.openai.com/billing
                </a>
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
                <pre className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
                  {suggestions}
                </pre>
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