import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/shared/PrivateRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProgressPage from './pages/ProgressPage'
import ResumePage from './pages/ResumePage'
import CareerPage from './pages/CareerPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/' element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path='/progress' element={<PrivateRoute><ProgressPage /></PrivateRoute>} />
          <Route path='/resume' element={<PrivateRoute><ResumePage /></PrivateRoute>} />
          <Route path='/career' element={<PrivateRoute><CareerPage /></PrivateRoute>} />
          <Route path='*' element={<Navigate to='/' />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}