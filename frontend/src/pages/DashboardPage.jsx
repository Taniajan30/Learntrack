import { useEffect, useState } from 'react'
import Sidebar from '../components/shared/Sidebar'
import { useAuth } from '../context/AuthContext'
import { getStats, getWeeklyProgress, getSavedCareer } from '../services/api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import Loader from '../components/shared/Loader'

/* ─── Theme tokens ─── */
const LIGHT = {
  bg:      '#f8fafc',
  surface: '#ffffff',
  surface2:'#f1f5f9',
  border:  'rgba(0,0,0,0.08)',
  text1:   '#0f172a',
  text2:   '#475569',
  text3:   '#94a3b8',
  tooltip: { background: '#fff', border: '1px solid rgba(0,0,0,0.08)', color: '#0f172a' },
}

const DARK = {
  bg:      '#0d0f14',
  surface: '#161920',
  surface2:'#1e2230',
  border:  'rgba(255,255,255,0.07)',
  text1:   '#f1f5f9',
  text2:   '#64748b',
  text3:   '#475569',
  tooltip: { background: '#1e2230', border: '1px solid rgba(255,255,255,0.07)', color: '#f1f5f9' },
}

/* ─── Bar colors for skill progress ─── */
const SKILL_COLORS = ['#10b981', '#4f8ef7', '#8b5cf6', '#f59e0b', '#f87171', '#06b6d4', '#ec4899']

/* ─── Greeting ─── */
function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

/* ─── Day counter: days since user registered ─── */
function getDayCount(createdAt) {
  if (!createdAt) return null
  const start = new Date(createdAt)
  const now   = new Date()
  const diff  = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1
  return diff
}

export default function DashboardPage() {
  const { user } = useAuth()

  /* persist theme */
  const [isDark, setIsDark] = useState(() => localStorage.getItem('trackify-theme') === 'dark')
  const t = isDark ? DARK : LIGHT

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev
      localStorage.setItem('trackify-theme', next ? 'dark' : 'light')
      return next
    })
  }

  /* ── State ── */
  const [stats,         setStats]         = useState({ totalDSA: 0, totalHours: 0, totalDays: 0 })
  const [weekly,        setWeekly]        = useState([])
  const [skills,        setSkills]        = useState([])   // [{name, pct}] from career backend
  const [careerMatches, setCareerMatches] = useState([])   // [{title, sub, pct}] from career backend
  const [loading,       setLoading]       = useState(true)
  const [animated,      setAnimated]      = useState(false)

  /* ── Fetch all data ── */
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, weeklyRes, careerRes] = await Promise.allSettled([
          getStats(),
          getWeeklyProgress(),
          getSavedCareer(),
        ])

        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value.data)
        }

        if (weeklyRes.status === 'fulfilled') {
          setWeekly(weeklyRes.value.data.map(d => ({
            date: d.date, DSA: d.dsaSolved, Hours: d.hoursStudied,
          })))
        }

        if (careerRes.status === 'fulfilled') {
          const data = careerRes.value.data

          // skillProgress: array of { name, pct } — from learning path generation
          if (Array.isArray(data.skillProgress) && data.skillProgress.length > 0) {
            setSkills(data.skillProgress)
          }

          // careerMatches: array of { title, sub, pct }
          if (Array.isArray(data.careerMatches) && data.careerMatches.length > 0) {
            setCareerMatches(data.careerMatches)
          }
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
        // ✅ FIX: removed setTimeout from here — animation is now triggered by skills state change below
      }
    }
    fetchAll()
  }, [])

  // ✅ FIX: trigger bar animation AFTER skills are set in state (so DOM exists and transition works)
  useEffect(() => {
    if (skills.length > 0) {
      const timer = setTimeout(() => setAnimated(true), 100)
      return () => clearTimeout(timer)
    }
  }, [skills])

  /* ── Day counter ── */
  const dayCount = getDayCount(user?.createdAt)

  /* ── Shared styles ── */
  const card = {
    background: t.surface,
    border: `1px solid ${t.border}`,
    borderRadius: 14,
    padding: '20px 22px',
  }

  const labelStyle = {
    fontSize: 10, fontWeight: 600, letterSpacing: 1,
    color: t.text3, textTransform: 'uppercase', marginBottom: 6,
  }

  const statCards = [
    { label: 'DSA Solved',  value: stats.totalDSA,         badge: 'Total',  accent: '#4f8ef7', glow: 'rgba(79,142,247,0.1)'  },
    { label: 'Study Hours', value: `${stats.totalHours}h`, badge: 'Logged', accent: '#10b981', glow: 'rgba(16,185,129,0.1)'  },
    { label: 'Days Logged', value: stats.totalDays,         badge: 'Total',  accent: '#f59e0b', glow: 'rgba(245,158,11,0.1)'  },
  ]

  /* ── Top career match percentage (for the big number) ── */
  const topMatch = careerMatches.length > 0 ? careerMatches[0] : null

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: t.bg,
      fontFamily: "'Sora', sans-serif",
      color: t.text1,
      transition: 'background 0.3s, color 0.3s',
    }}>
      <Sidebar theme={t} />

      <main style={{ flex: 1, padding: '28px 32px', background: t.bg, transition: 'background 0.3s' }}>

        {/* ── Top bar ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: -0.4, color: t.text1 }}>
              {getGreeting()}, {user?.name} 👋
            </h1>
            <p style={{ fontSize: 12, color: t.text2, marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
              Goal: {user?.goal || 'Not set yet'}
              {dayCount !== null && (
                <span style={{
                  background: 'rgba(79,142,247,0.12)', color: '#4f8ef7',
                  fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                }}>
                  Day {dayCount} of 180
                </span>
              )}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '7px 14px', borderRadius: 20,
                border: `1px solid ${t.border}`,
                background: t.surface, color: t.text2,
                fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {isDark ? '☀️' : '🌙'} {isDark ? 'Light mode' : 'Dark mode'}
            </button>

            {/* Avatar */}
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg,#4f8ef7,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 14, fontWeight: 700,
              boxShadow: '0 0 16px rgba(79,142,247,0.25)',
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </div>

        {loading ? <Loader /> : (
          <>
            {/* ── Stat cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
              {statCards.map(c => (
                <div
                  key={c.label}
                  style={{ ...card, transition: 'transform 0.2s, background 0.3s, border 0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <p style={labelStyle}>{c.label}</p>
                  <p style={{ fontSize: 32, fontWeight: 700, letterSpacing: -1, marginTop: 6, fontFamily: "'JetBrains Mono', monospace", color: c.accent }}>
                    {c.value}
                  </p>
                  <span style={{ background: c.glow, color: c.accent, fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 20, display: 'inline-block', marginTop: 8 }}>
                    {c.badge}
                  </span>
                </div>
              ))}
            </div>

            {/* ── Bottom 2-col grid ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

              {/* ── 1. Learning path progress ── */}
              <div style={{ ...card, transition: 'background 0.3s, border 0.3s' }}>
                <SectionTitle icon="📈" bg="rgba(79,142,247,0.1)" title="Learning path progress" t={t} />

                {skills.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🗺️</div>
                    <p style={{ fontSize: 12, color: t.text2 }}>
                      No skills tracked yet.
                    </p>
                    <p style={{ fontSize: 11, color: t.text3, marginTop: 4 }}>
                      Go to <strong>Career AI</strong> → generate a learning path to populate this.
                    </p>
                  </div>
                ) : (
                  skills.map((s, i) => {
                    const color = SKILL_COLORS[i % SKILL_COLORS.length]
                    return (
                      <div key={s.name} style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                          <span style={{ fontWeight: 500, color: t.text1 }}>{s.name}</span>
                          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color }}>
                            {s.pct}%
                          </span>
                        </div>
                        <div style={{ height: 6, background: t.surface2, borderRadius: 20, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: 20, background: color,
                            width: animated ? `${s.pct}%` : '0%',
                            transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
                          }} />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* ── 2. Resume skill analysis (Coming soon) ── */}
              <div style={{ ...card, transition: 'background 0.3s, border 0.3s' }}>
                <SectionTitle icon="📄" bg="rgba(16,185,129,0.1)" title="Resume skill analysis" t={t} />
                <div style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  padding: '28px 0', gap: 10,
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: 'rgba(245,158,11,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22,
                  }}>⏳</div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: t.text1 }}>Coming Soon</p>
                  <p style={{ fontSize: 11, color: t.text3, textAlign: 'center', maxWidth: 200 }}>
                    Resume Analyzer is under development. Upload your resume to get skill insights.
                  </p>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                    background: 'rgba(245,158,11,0.1)', color: '#f59e0b',
                    border: '1px solid rgba(245,158,11,0.2)',
                  }}>In progress</span>
                </div>
              </div>

              {/* ── 3. AI career suggestion ── */}
              <div style={{ ...card, transition: 'background 0.3s, border 0.3s', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: t.text1 }}>
                  AI career suggestion
                </h2>

                {careerMatches.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🎯</div>
                    <p style={{ fontSize: 12, color: t.text2 }}>No career data yet.</p>
                    <p style={{ fontSize: 11, color: t.text3, marginTop: 4 }}>
                      Go to <strong>Career AI</strong> → get suggestions to see your matches here.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <p style={{ fontSize: 13, color: t.text2, marginBottom: 16, lineHeight: 1.4 }}>
                      Based on your skills, you are a strong match for:
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
                      {careerMatches.slice(0, 3).map((c, i) => (
                        <div key={c.title} style={{
                          fontSize: i === 0 ? 14 : 13,
                          fontWeight: i === 0 ? 600 : 400,
                          color: i === 0 ? t.text1 : t.text2,
                        }}>
                          {c.title}
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: 'auto' }}>
                      <span style={{
                        display: 'inline-block',
                        background: isDark ? 'rgba(79,142,247,0.15)' : '#e0f2fe',
                        color: isDark ? '#60a5fa' : '#0284c7',
                        fontSize: 12,
                        fontWeight: 600,
                        padding: '4px 12px',
                        borderRadius: 20,
                      }}>
                        {topMatch.pct}% match
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* ── 4. Weekly activity chart ── */}
              <div style={{ ...card, transition: 'background 0.3s, border 0.3s' }}>
                <SectionTitle icon="📊" bg="rgba(79,142,247,0.1)" title="Weekly activity" t={t} />
                {weekly.length === 0 ? (
                  <p style={{ fontSize: 13, color: t.text2, textAlign: 'center', padding: '24px 0' }}>
                    No data yet — start logging in Progress!
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={weekly} barSize={10}>
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: t.text3 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: t.text3 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: t.tooltip.background, border: t.tooltip.border, borderRadius: 8, fontSize: 12, color: t.tooltip.color }} />
                      <Bar dataKey="DSA"   fill="#4f8ef7" radius={[4,4,0,0]} />
                      <Bar dataKey="Hours" fill="#10b981" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

            </div>
          </>
        )}
      </main>
    </div>
  )
}

/* ─── Section title helper ─── */
function SectionTitle({ icon, bg, title, t }) {
  return (
    <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 7, color: t.text1 }}>
      <span style={{ background: bg, borderRadius: 6, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>
        {icon}
      </span>
      {title}
    </h2>
  )
}