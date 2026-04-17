import axios from 'axios'

const AUTH_URL = import.meta.env.VITE_AUTH_URL
const PROGRESS_URL = import.meta.env.VITE_PROGRESS_URL
const RESUME_URL = import.meta.env.VITE_RESUME_URL
const CAREER_URL = import.meta.env.VITE_CAREER_URL

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

// Auth
export const registerUser = (data) => axios.post(`${AUTH_URL}/api/auth/register`, data)
export const loginUser = (data) => axios.post(`${AUTH_URL}/api/auth/login`, data)
export const getProfile = () => axios.get(`${AUTH_URL}/api/auth/profile`, authHeaders())
export const updateGoal = (data) => axios.put(`${AUTH_URL}/api/auth/goal`, data, authHeaders())

// Progress
export const addProgress = (data) => axios.post(`${PROGRESS_URL}/api/progress`, data, authHeaders())
export const getMyProgress = () => axios.get(`${PROGRESS_URL}/api/progress`, authHeaders())
export const getWeeklyProgress = () => axios.get(`${PROGRESS_URL}/api/progress/weekly`, authHeaders())
export const getStats = () => axios.get(`${PROGRESS_URL}/api/progress/stats`, authHeaders())
export const deleteProgress = (id) => axios.delete(`${PROGRESS_URL}/api/progress/${id}`, authHeaders())

// Resume
export const uploadResume = (formData) => axios.post(`${RESUME_URL}/api/resume/upload`, formData, {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'multipart/form-data'
  }
})
export const getResumeResult = () => axios.get(`${RESUME_URL}/api/resume/result`, authHeaders())

// Career
export const generateLearningPath = (data) => axios.post(`${CAREER_URL}/api/career/learning-path`, data, authHeaders())
export const generateCareerSuggestions = (data) => axios.post(`${CAREER_URL}/api/career/suggest`, data, authHeaders())
export const getSavedCareer = () => axios.get(`${CAREER_URL}/api/career/saved`, authHeaders())