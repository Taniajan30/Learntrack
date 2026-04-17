import { useEffect, useState } from 'react'
import Sidebar from '../components/shared/Sidebar'
import { addProgress, getMyProgress, deleteProgress } from '../services/api'
import Loader from '../components/shared/Loader'

export default function ProgressPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], dsaSolved: '', hoursStudied: '', topic: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState('')

  const fetchLogs = async () => {
    try {
      const res = await getMyProgress()
      setLogs(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLogs() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await addProgress({ ...form, dsaSolved: Number(form.dsaSolved), hoursStudied: Number(form.hoursStudied) })
      setMsg('Progress logged!')
      setForm({ date: new Date().toISOString().split('T')[0], dsaSolved: '', hoursStudied: '', topic: '', notes: '' })
      fetchLogs()
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setMsg('Failed to log')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    await deleteProgress(id)
    setLogs(logs.filter(l => l._id !== id))
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-lg font-medium text-slate-900 mb-5">Progress tracker</h1>

        <div className="bg-white border border-slate-200 rounded-lg p-5 mb-6">
          <h2 className="text-sm font-medium text-slate-700 mb-4">Log today's work</h2>
          {msg && <div className="bg-green-50 text-green-700 text-sm px-3 py-2 rounded mb-3">{msg}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            {[
              { label: 'Date', key: 'date', type: 'date' },
              { label: 'DSA questions solved', key: 'dsaSolved', type: 'number' },
              { label: 'Hours studied', key: 'hoursStudied', type: 'number' },
              { label: 'Topic covered', key: 'topic', type: 'text' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-slate-500 mb-1 block">{f.label}</label>
                <input
                  type={f.type}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                />
              </div>
            ))}
            <div className="col-span-2">
              <label className="text-xs text-slate-500 mb-1 block">Notes</label>
              <textarea
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                rows={2}
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Log progress'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="text-sm font-medium text-slate-700 mb-4">All logs</h2>
          {loading ? <Loader /> : logs.length === 0 ? (
            <p className="text-sm text-slate-400">No logs yet. Start logging above!</p>
          ) : (
            <div className="flex flex-col gap-3">
              {logs.map(log => (
                <div key={log._id} className="flex items-center justify-between border border-slate-100 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{log.date} — {log.topic || 'General'}</p>
                    <p className="text-xs text-slate-500 mt-0.5">DSA: {log.dsaSolved} &nbsp;|&nbsp; Hours: {log.hoursStudied}h &nbsp;|&nbsp; {log.notes}</p>
                  </div>
                  <button onClick={() => handleDelete(log._id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}