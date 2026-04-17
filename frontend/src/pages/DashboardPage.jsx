import { useEffect, useState } from 'react'
import Sidebar from '../components/shared/Sidebar'
import { useAuth } from '../context/AuthContext'
import { getStats, getWeeklyProgress } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import Loader from '../components/shared/Loader'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ totalDSA: 0, totalHours: 0, totalDays: 0 })
  const [weekly, setWeekly] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, weeklyRes] = await Promise.all([getStats(), getWeeklyProgress()])
        setStats(statsRes.data)
        setWeekly(weeklyRes.data.map(d => ({ date: d.date, DSA: d.dsaSolved, Hours: d.hoursStudied })))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-medium text-slate-900">{greeting()}, {user?.name}</h1>
            <p className="text-sm text-slate-500">Goal: {user?.goal || 'Not set yet'}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
            {user?.name?.[0]?.toUpperCase()}
          </div>
        </div>

        {loading ? <Loader /> : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'DSA solved', value: stats.totalDSA, badge: 'Total', color: 'blue' },
                { label: 'Study hours', value: `${stats.totalHours}h`, badge: 'Total', color: 'green' },
                { label: 'Days logged', value: stats.totalDays, badge: 'Total', color: 'amber' },
              ].map(card => (
                <div key={card.label} className="bg-white border border-slate-200 rounded-lg p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{card.label}</p>
                  <p className="text-2xl font-medium text-slate-900 mt-1">{card.value}</p>
                  <span className="text-xs bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full mt-1 inline-block">{card.badge}</span>
                </div>
              ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h2 className="text-sm font-medium text-slate-700 mb-4">Weekly activity</h2>
              {weekly.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No data yet — start logging your progress!</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={weekly}>
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="DSA" fill="#378ADD" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Hours" fill="#1D9E75" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}