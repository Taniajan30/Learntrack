import { useEffect, useState } from 'react'
import Sidebar from '../components/shared/Sidebar'
import { useAuth } from '../context/AuthContext'
import { getStats, getWeeklyProgress } from '../services/api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import Loader from '../components/shared/Loader'

const SKILLS = [
  { name: 'HTML / CSS',  pct: 100, color: '#10b981' },
  { name: 'JavaScript',  pct: 78,  color: '#4f8ef7' },
  { name: 'React.js',    pct: 54,  color: '#8b5cf6' },
  { name: 'Node.js',     pct: 30,  color: '#f59e0b' },
  { name: 'MongoDB',     pct: 10,  color: '#f87171' },
]

const DETECTED_SKILLS = ['React', 'Node.js', 'MongoDB', 'HTML/CSS']
const MISSING_SKILLS  = ['TypeScript', 'Docker', 'Redis']

const CAREER_MATCHES = [
  { title: 'Full-stack Developer', sub: 'Best match for your profile', pct: 87, color: '#10b981', top: true  },
  { title: 'Frontend Developer',   sub: 'Strong React & CSS skills',   pct: 74, color: '#4f8ef7', top: false },
  { title: 'Backend Engineer',     sub: 'Node.js & MongoDB',           pct: 58, color: '#64748b', top: false },
]

/* ─── Theme tokens ─── */
const LIGHT = {
  bg:        '#f8fafc',
  surface:   '#ffffff',
  surface2:  '#f1f5f9',
  border:    'rgba(0,0,0,0.08)',
  text1:     '#0f172a',
  text2:     '#475569',
  text3:     '#94a3b8',
  sidebar:   '#ffffff',
  tooltip:   { background: '#fff', border: '1px solid rgba(0,0,0,0.08)', color: '#0f172a' },
}

const DARK = {
  bg:        '#0d0f14',
  surface:   '#161920',
  surface2:  '#1e2230',
  border:    'rgba(255,255,255,0.07)',
  text1:     '#f1f5f9',
  text2:     '#64748b',
  text3:     '#475569',
  sidebar:   '#161920',
  tooltip:   { background: '#1e2230', border: '1px solid rgba(255,255,255,0.07)', color: '#f1f5f9' },
}

/* ─── Greeting helper ─── */
function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const { user } = useAuth()

  /* persist theme in localStorage */
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('trackify-theme') === 'dark'
  })
  const t = isDark ? DARK : LIGHT

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev
      localStorage.setItem('trackify-theme', next ? 'dark' : 'light')
      return next
    })
  }

  const [stats,    setStats]    = useState({ totalDSA: 0, totalHours: 0, totalDays: 0 })
  const [weekly,   setWeekly]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, weeklyRes] = await Promise.all([getStats(), getWeeklyProgress()])
        setStats(statsRes.data)
        setWeekly(weeklyRes.data.map(d => ({
          date: d.date, DSA: d.dsaSolved, Hours: d.hoursStudied,
        })))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
        setTimeout(() => setAnimated(true), 100)
      }
    }
    fetchData()
  }, [])

  /* ─── Shared style helpers ─── */
  const card = {
    background:   t.surface,
    border:       `1px solid ${t.border}`,
    borderRadius: 14,
    padding:      '20px 22px',
  }

  const labelStyle = {
    fontSize: 10, fontWeight: 600, letterSpacing: 1,
    color: t.text3, textTransform: 'uppercase', marginBottom: 6,
  }

  const statCards = [
    { label: 'DSA Solved',   value: stats.totalDSA,         badge: 'Total',      accent: '#4f8ef7', glow: 'rgba(79,142,247,0.1)'  },
    { label: 'Study Hours',  value: `${stats.totalHours}h`, badge: 'This month', accent: '#10b981', glow: 'rgba(16,185,129,0.1)'  },
    { label: 'Days Logged',  value: stats.totalDays,         badge: 'Total',      accent: '#f59e0b', glow: 'rgba(245,158,11,0.1)'  },
  ]

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: t.bg,
      fontFamily: "'Sora', sans-serif",
      color: t.text1,
      transition: 'background 0.3s, color 0.3s',
    }}>
      <Sidebar theme={t} />

      <main style={{
        flex: 1, padding: '28px 32px',
        background: t.bg,
        transition: 'background 0.3s',
      }}>

        {/* ── Top bar ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: -0.4, color: t.text1 }}>
              {getGreeting()}, {user?.name} 👋
            </h1>
            <p style={{ fontSize: 12, color: t.text2, marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
              Goal: {user?.goal || 'Not set yet'}
              <span style={{
                background: 'rgba(79,142,247,0.12)', color: '#4f8ef7',
                fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
              }}>
                Day 2 of 180
              </span>
            </p>
          </div>

          {/* Right side: toggle + avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

            {/* Theme toggle button */}
            <button
              onClick={toggleTheme}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '7px 14px', borderRadius: 20,
                border: `1px solid ${t.border}`,
                background: t.surface,
                color: t.text2,
                fontSize: 11, fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#4f8ef7'
                e.currentTarget.style.color = '#4f8ef7'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = t.border
                e.currentTarget.style.color = t.text2
              }}
            >
              <span style={{ fontSize: 14 }}>{isDark ? '☀️' : '🌙'}</span>
              {isDark ? 'Light mode' : 'Dark mode'}
            </button>

            {/* Avatar */}
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg,#4f8ef7,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 14, color: '#fff',
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
                  <p style={{
                    fontSize: 32, fontWeight: 700, letterSpacing: -1, marginTop: 6,
                    fontFamily: "'JetBrains Mono', monospace", color: c.accent,
                  }}>
                    {c.value}
                  </p>
                  <span style={{
                    background: c.glow, color: c.accent,
                    fontSize: 11, fontWeight: 500, padding: '3px 9px',
                    borderRadius: 20, display: 'inline-block', marginTop: 8,
                  }}>
                    {c.badge}
                  </span>
                </div>
              ))}
            </div>

            {/* ── Bottom 2-col grid ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

              {/* Learning path progress */}
              <div style={{ ...card, transition: 'background 0.3s, border 0.3s' }}>
                <SectionTitle icon="📈" bg="rgba(79,142,247,0.1)" title="Learning path progress" />
                {SKILLS.map(s => (
                  <div key={s.name} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                      <span style={{ fontWeight: 500, color: t.text1 }}>{s.name}</span>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: s.color }}>
                        {s.pct}%
                      </span>
                    </div>
                    <div style={{ height: 6, background: t.surface2, borderRadius: 20, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 20, background: s.color,
                        width: animated ? `${s.pct}%` : '0%',
                        transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Resume skill analysis */}
              <div style={{ ...card, transition: 'background 0.3s, border 0.3s' }}>
                <SectionTitle icon="📄" bg="rgba(16,185,129,0.1)" title="Resume skill analysis" />

                <p style={labelStyle}>✓ Skills detected</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {DETECTED_SKILLS.map(s => (
                    <span key={s} style={{
                      fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 20,
                      background: 'rgba(16,185,129,0.1)', color: '#10b981',
                      border: '1px solid rgba(16,185,129,0.2)',
                    }}>{s}</span>
                  ))}
                </div>

                <p style={labelStyle}>⚠ Missing skills</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {MISSING_SKILLS.map(s => (
                    <span key={s} style={{
                      fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 20,
                      background: 'rgba(245,158,11,0.08)', color: '#f59e0b',
                      border: '1px solid rgba(245,158,11,0.2)',
                    }}>{s}</span>
                  ))}
                </div>
              </div>

              {/* AI career suggestion */}
              <div style={{ ...card, transition: 'background 0.3s, border 0.3s' }}>
                <SectionTitle icon="🤖" bg="rgba(139,92,246,0.1)" title="AI career suggestion" />
                <div style={{
                  fontSize: 36, fontWeight: 700,
                  fontFamily: "'JetBrains Mono',monospace", color: '#10b981',
                }}>87%</div>
                <p style={{ fontSize: 11, color: t.text2, marginBottom: 14 }}>match based on your skills</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {CAREER_MATCHES.map(c => (
                    <div key={c.title} style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px', borderRadius: 10,
                      background: c.top
                        ? (isDark ? 'rgba(79,142,247,0.08)' : 'rgba(79,142,247,0.05)')
                        : t.surface2,
                      border: `1px solid ${c.top ? 'rgba(79,142,247,0.25)' : t.border}`,
                      fontSize: 12,
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, color: t.text1 }}>{c.title}</div>
                        <div style={{ fontSize: 10, color: t.text2, marginTop: 1 }}>{c.sub}</div>
                      </div>
                      <div style={{
                        fontFamily: "'JetBrains Mono',monospace",
                        fontWeight: 600, color: c.color,
                      }}>{c.pct}%</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly activity chart */}
              <div style={{ ...card, transition: 'background 0.3s, border 0.3s' }}>
                <SectionTitle icon="📊" bg="rgba(79,142,247,0.1)" title="Weekly activity" />
                {weekly.length === 0 ? (
                  <p style={{ fontSize: 13, color: t.text2, textAlign: 'center', padding: '24px 0' }}>
                    No data yet — start logging!
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={weekly} barSize={10}>
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: t.text3 }}
                        axisLine={false} tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: t.text3 }}
                        axisLine={false} tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: t.tooltip.background,
                          border: t.tooltip.border,
                          borderRadius: 8, fontSize: 12,
                          color: t.tooltip.color,
                        }}
                      />
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

/* ─── Small reusable section title ─── */
function SectionTitle({ icon, bg, title }) {
  return (
    <h2 style={{
      fontSize: 13, fontWeight: 600, marginBottom: 16,
      display: 'flex', alignItems: 'center', gap: 7,
    }}>
      <span style={{
        background: bg, borderRadius: 6,
        width: 22, height: 22,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11,
      }}>
        {icon}
      </span>
      {title}
    </h2>
  )
}