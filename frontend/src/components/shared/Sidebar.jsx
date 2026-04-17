import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/progress', label: 'Progress' },
  { path: '/resume', label: 'Resume' },
  { path: '/career', label: 'Career AI' },
]

export default function Sidebar() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="w-48 min-h-screen bg-slate-900 flex flex-col py-5">
      <div className="px-5 pb-4 border-b border-slate-700 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="text-white font-medium text-sm">LearnTrack</span>
        </div>
        <p className="text-slate-400 text-xs mt-2 truncate">{user?.name}</p>
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-2">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `px-3 py-2 rounded text-sm transition-colors ${
                isActive
                  ? 'bg-blue-900/30 text-white border-l-2 border-blue-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 mt-4">
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  )
}