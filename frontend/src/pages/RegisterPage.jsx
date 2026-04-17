import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', goal: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await registerUser(form)
      login(res.data.token, res.data.user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white border border-slate-200 rounded-xl p-8 w-full max-w-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="font-medium text-slate-900">LearnTrack</span>
        </div>
        <h1 className="text-xl font-medium text-slate-900 mb-1">Create account</h1>
        <p className="text-sm text-slate-500 mb-6">Start your learning journey</p>

        {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {[
            { label: 'Full name', key: 'name', type: 'text' },
            { label: 'Email', key: 'email', type: 'email' },
            { label: 'Password', key: 'password', type: 'password' },
          ].map(field => (
            <div key={field.key}>
              <label className="text-sm text-slate-600 mb-1 block">{field.label}</label>
              <input
                type={field.type}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                value={form[field.key]}
                onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                required
              />
            </div>
          ))}
          <div>
            <label className="text-sm text-slate-600 mb-1 block">Your goal</label>
            <select
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              value={form.goal}
              onChange={e => setForm({ ...form, goal: e.target.value })}
            >
              <option value="">Select a goal</option>
              <option value="Full-stack Developer">Full-stack Developer</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="ML Engineer">ML Engineer</option>
              <option value="DevOps Engineer">DevOps Engineer</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-slate-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-slate-500 text-center mt-4">
          Have an account? <Link to='/login' className="text-blue-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}