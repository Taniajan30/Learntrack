import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function PrivateRoute({ children }) {
  const { token, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen text-slate-500">Loading...</div>
  return token ? children : <Navigate to='/login' />
}