import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AppLayout } from './components/layout/AppLayout'

import Login from './pages/Auth/Login'
import SignUp from './pages/Auth/SignUp'
import LandingPage from './pages/Landing/LandingPage'
import Dashboard from './pages/Dashboard/Dashboard'
import Events from './pages/Events/Events'
import TeamFinder from './pages/TeamFinder/TeamFinder'
import Matches from './pages/Matches/Matches'
import Chat from './pages/Chat/Chat'
import Profile from './pages/Profile/Profile'

// Admin Pages
import AdminLogin from './pages/Admin/Login'
import { AdminRouteGuard } from './components/auth/AdminRouteGuard'
import { AdminLayout } from './components/layout/AdminLayout'
import AdminDashboard from './pages/Admin/Dashboard'
import AdminEventsList from './pages/Admin/EventsList'
import AdminUsersList from './pages/Admin/UsersList'
import AdminAnalytics from './pages/Admin/Analytics'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Landing & Auth Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Student Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/events" element={<Events />} />
              <Route path="/team-finder" element={<TeamFinder />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/chat/:matchId" element={<Chat />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Admin Protected Routes with AdminRouteGuard */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route element={<AdminRouteGuard />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/events" element={<AdminEventsList />} />
              <Route path="/admin/users" element={<AdminUsersList />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
