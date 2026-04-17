import { useEffect, useState } from 'react'
import Sidebar from '../components/shared/Sidebar'
import { useAuth } from '../context/AuthContext'
import { getStats, getWeeklyProgress } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import Loader from '../components/shared/Loader'

const SKILLS = [
  { name: 'HTML / CSS', pct: 100, color: '#34d399' },
  { name: 'JavaScript', pct: 78,  color: '#4f8ef7' },
  { name: 'React.js',   pct: 54,  color: '#a78bfa' },
  { name: 'Node.js',    pct: 30,  color: '#fbbf24' },
  { name: 'MongoDB',    pct: 10,  color: '#f87171' },
]

const DETECTED_SKILLS = ['React', 'Node.js', 'MongoDB', 'HTML/CSS']
const MISSING_SKILLS  = ['TypeScript', 'Docker', 'Redis']

const CAREER_MATCHES = [
  { title: 'Full-stack Developer', sub: 'Best match for your profile', pct: 87, color: '#34d399', top: true },
  { title: 'Frontend Developer',   sub: 'Strong React & CSS skills',   pct: 74, color: '#4f8ef7' },
  { title: 'Backend Engineer',     sub: 'Node.js & MongoDB',           pct: 58, color: '#64748b' },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats]   = useState({ totalDSA: 0, totalHours: 0, totalDays: 0 })
  const [weekly, setWeekly] = useState([])
  const [loading, setLoading] = useState(true)
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

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const statCards = [
    { label: 'DSA Solved',   value: stats.totalDSA,        badge: 'Total',      accent: '#4f8ef7', glow: 'rgba(79,142,247,0.12)'  },
    { label: 'Study Hours',  value: `${stats.totalHours}h`, badge: 'This month', accent: '#34d399', glow: 'rgba(52,211,153,0.12)'  },
    { label: 'Days Logged',  value: stats.totalDays,        badge: 'Total',      accent: '#fbbf24', glow: 'rgba(251,191,36,0.12)'  },
  ]

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#0d0f14', fontFamily:"'Sora', sans-serif", color:'#f1f5f9' }}>
      <Sidebar />

      <main style={{ flex:1, padding:'28px 32px', background:'radial-gradient(ellipse at 80% 0%, rgba(79,142,247,0.04), transparent 60%)' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
          <div>
            <h1 style={{ fontSize:20, fontWeight:600, letterSpacing:-0.4 }}>
              {greeting()}, {user?.name} 👋
            </h1>
            <p style={{ fontSize:12, color:'#64748b', marginTop:3, display:'flex', alignItems:'center', gap:6 }}>
              Goal: {user?.goal || 'Not set yet'}
              <span style={{ background:'rgba(79,142,247,0.15)', color:'#4f8ef7', fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:20 }}>
                Day 2 of 180
              </span>
            </p>
          </div>
          <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#4f8ef7,#a78bfa)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14, boxShadow:'0 0 20px rgba(79,142,247,0.3)' }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
        </div>

        {loading ? <Loader /> : (
          <>
            {/* Stat Cards */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:20 }}>
              {statCards.map(c => (
                <div key={c.label} style={{ background:'#161920', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'18px 20px', transition:'transform 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
                  <p style={{ fontSize:10, fontWeight:600, letterSpacing:1, color:'#64748b', textTransform:'uppercase' }}>{c.label}</p>
                  <p style={{ fontSize:32, fontWeight:700, letterSpacing:-1, marginTop:6, fontFamily:"'JetBrains Mono',monospace", color: c.accent }}>{c.value}</p>
                  <span style={{ background: c.glow, color: c.accent, fontSize:11, fontWeight:500, padding:'3px 9px', borderRadius:20, display:'inline-block', marginTop:8 }}>{c.badge}</span>
                </div>
              ))}
            </div>

            {/* Bottom 2-col grid */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

              {/* Learning path */}
              <div style={{ background:'#161920', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'20px 22px' }}>
                <h2 style={{ fontSize:13, fontWeight:600, marginBottom:16, display:'flex', alignItems:'center', gap:7 }}>
                  <span style={{ background:'rgba(79,142,247,0.12)', borderRadius:6, width:22, height:22, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11 }}>📈</span>
                  Learning path progress
                </h2>
                {SKILLS.map(s => (
                  <div key={s.name} style={{ marginBottom:14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:12 }}>
                      <span style={{ fontWeight:500 }}>{s.name}</span>
                      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color: s.color }}>{s.pct}%</span>
                    </div>
                    <div style={{ height:6, background:'rgba(255,255,255,0.06)', borderRadius:20, overflow:'hidden' }}>
                      <div style={{ height:'100%', borderRadius:20, background: s.color, width: animated ? `${s.pct}%` : '0%', transition:'width 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Resume skills */}
              <div style={{ background:'#161920', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'20px 22px' }}>
                <h2 style={{ fontSize:13, fontWeight:600, marginBottom:16, display:'flex', alignItems:'center', gap:7 }}>
                  <span style={{ background:'rgba(52,211,153,0.12)', borderRadius:6, width:22, height:22, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11 }}>📄</span>
                  Resume skill analysis
                </h2>

                <p style={{ fontSize:10, fontWeight:600, letterSpacing:0.5, color:'#64748b', marginBottom:6 }}>✓ SKILLS DETECTED</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:16 }}>
                  {DETECTED_SKILLS.map(s => (
                    <span key={s} style={{ fontSize:11, fontWeight:500, padding:'4px 10px', borderRadius:20, background:'rgba(52,211,153,0.1)', color:'#34d399', border:'1px solid rgba(52,211,153,0.2)' }}>{s}</span>
                  ))}
                </div>

                <p style={{ fontSize:10, fontWeight:600, letterSpacing:0.5, color:'#64748b', marginBottom:6 }}>⚠ MISSING SKILLS</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {MISSING_SKILLS.map(s => (
                    <span key={s} style={{ fontSize:11, fontWeight:500, padding:'4px 10px', borderRadius:20, background:'rgba(251,191,36,0.08)', color:'#fbbf24', border:'1px solid rgba(251,191,36,0.2)' }}>{s}</span>
                  ))}
                </div>
              </div>

              {/* AI career */}
              <div style={{ background:'#161920', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'20px 22px' }}>
                <h2 style={{ fontSize:13, fontWeight:600, marginBottom:16, display:'flex', alignItems:'center', gap:7 }}>
                  <span style={{ background:'rgba(167,139,250,0.12)', borderRadius:6, width:22, height:22, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11 }}>🤖</span>
                  AI career suggestion
                </h2>
                <div style={{ fontSize:36, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", color:'#34d399' }}>87%</div>
                <p style={{ fontSize:11, color:'#64748b', marginBottom:14 }}>match based on your skills</p>

                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {CAREER_MATCHES.map(c => (
                    <div key={c.title} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderRadius:10, background: c.top ? 'rgba(79,142,247,0.08)' : '#1e2230', border: `1px solid ${c.top ? 'rgba(79,142,247,0.25)' : 'rgba(255,255,255,0.07)'}`, fontSize:12 }}>
                      <div>
                        <div style={{ fontWeight:600 }}>{c.title}</div>
                        <div style={{ fontSize:10, color:'#64748b', marginTop:1 }}>{c.sub}</div>
                      </div>
                      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:600, color: c.color }}>{c.pct}%</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly chart */}
              <div style={{ background:'#161920', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'20px 22px' }}>
                <h2 style={{ fontSize:13, fontWeight:600, marginBottom:16, display:'flex', alignItems:'center', gap:7 }}>
                  <span style={{ background:'rgba(79,142,247,0.12)', borderRadius:6, width:22, height:22, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11 }}>📊</span>
                  Weekly activity
                </h2>
                {weekly.length === 0 ? (
                  <p style={{ fontSize:13, color:'#64748b', textAlign:'center', padding:'24px 0' }}>No data yet — start logging!</p>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={weekly} barSize={10}>
                      <XAxis dataKey="date" tick={{ fontSize:10, fill:'#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize:10, fill:'#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background:'#1e2230', border:'1px solid rgba(255,255,255,0.07)', borderRadius:8, fontSize:12 }} />
                      <Bar dataKey="DSA"   fill="#4f8ef7" radius={[4,4,0,0]} />
                      <Bar dataKey="Hours" fill="#34d399" radius={[4,4,0,0]} />
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