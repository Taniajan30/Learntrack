import { useState, useEffect } from 'react'
import Sidebar from '../components/shared/Sidebar'
import { generateLearningPath, generateCareerSuggestions, getSavedCareer } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/shared/Loader'

export default function CareerPage() {
  const { user } = useAuth()
  const [skills, setSkills] = useState('')
  const [interests, setInterests] = useState('')
  const [learningPath, setLearningPath] = useState('')
  const [suggestions, setSuggestions] = useState('')
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('path')
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    getSavedCareer()
      .then(res => {
        setLearningPath(res.data.learningPath || '')
        setSuggestions(res.data.careerSuggestions || '')
        setSkills(res.data.skills?.join(', ') || '')
      })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [])

  const handleGeneratePath = async () => {
    setLoading(true)
    try {
      const res = await generateLearningPath({
        goal: user?.goal || 'Full-stack Developer',
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      })
      setLearningPath(res.data.learningPath)
    } catch (err) {
      alert('AI error. Check your OpenAI API key.')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateSuggestions = async () => {
    setLoading(true)
    try {
      const res = await generateCareerSuggestions({
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        interests,
      })
      setSuggestions(res.data.careerSuggestions)
    } catch (err) {
      alert('AI error. Check your OpenAI API key.')
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

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTab('path')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'path' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            Learning path
          </button>
          <button
            onClick={() => setTab('career')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'career' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            Career suggestions
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          {tab === 'path' ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-medium text-slate-700">Learning path for: <span className="text-blue-600">{user?.goal || 'your goal'}</span></h2>
                </div>
                <button
                  onClick={handleGeneratePath}
                  disabled={loading}
                  className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-50"
                >
                  {loading ? 'Generating...' : 'Generate path'}
                </button>
              </div>
              {fetching ? <Loader /> : learningPath ? (
                <pre className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{learningPath}</pre>
              ) : (
                <p className="text-sm text-slate-400">Click "Generate path" to get your personalized roadmap.</p>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-slate-700">Career suggestions based on your skills</h2>
                <button
                  onClick={handleGenerateSuggestions}
                  disabled={loading}
                  className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-50"
                >
                  {loading ? 'Generating...' : 'Get suggestions'}
                </button>
              </div>
              {fetching ? <Loader /> : suggestions ? (
                <pre className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{suggestions}</pre>
              ) : (
                <p className="text-sm text-slate-400">Enter your skills above and click "Get suggestions".</p>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}