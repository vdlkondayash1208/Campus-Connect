import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { Toaster, toast } from 'react-hot-toast'
import { 
  ShieldCheck, LayoutDashboard, CalendarDays, Users, 
  ArrowUpRight, LogOut, Sparkles, GraduationCap 
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { adminSignOut } from '../../services/adminApi'

export const AdminLayout = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Get admin email from user or stored session
  let adminEmail = user?.email || 'faculty.admin@university.edu'
  if (!user?.email) {
    try {
      const stored = localStorage.getItem('faculty_admin_session')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.email) adminEmail = parsed.email
      }
    } catch (e) {}
  }

  const handleSignOut = async () => {
    try {
      await adminSignOut()
      toast.success('Signed out of Faculty Console')
      navigate('/admin/login', { replace: true })
    } catch (e) {
      navigate('/admin/login', { replace: true })
    }
  }

  const navTabs = [
    { name: 'Overview Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Event Management', path: '/admin/events', icon: CalendarDays },
    { name: 'Student Directory', path: '/admin/users', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-slate-50 [background-image:radial-gradient(rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:24px_24px] text-slate-900 flex flex-col font-sans selection:bg-indigo-500/20 selection:text-indigo-900 antialiased">
      
      {/* 1. Persistent Pinned Sticky Light Navbar */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Logo + "CampusConnect Faculty Console" */}
            <div className="flex items-center gap-3 shrink-0">
              <Link to="/admin/dashboard" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                  <GraduationCap size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-1.5">
                    CampusConnect
                    <span className="text-indigo-600 font-bold text-xs bg-indigo-50 border border-indigo-200/60 px-1.5 py-0.5 rounded-md">
                      Faculty Console
                    </span>
                  </span>
                </div>
              </Link>
            </div>

            {/* Sub-Navigation Tabs (Desktop) */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
              {navTabs.map((tab) => {
                const isActive = location.pathname === tab.path
                const Icon = tab.icon
                return (
                  <NavLink
                    key={tab.path}
                    to={tab.path}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-white text-indigo-600 shadow-xs font-bold border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <Icon size={14} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                    <span>{tab.name}</span>
                  </NavLink>
                )
              })}
            </nav>

            {/* Right Controls: Email Chip, FACULTY ADMIN Badge, Student View Link, Sign Out */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Admin Email Chip + FACULTY ADMIN Badge */}
              <div className="hidden lg:flex items-center gap-2 pl-3 pr-2 py-1 bg-slate-50 border border-slate-200 rounded-full">
                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                  {adminEmail.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-slate-700 truncate max-w-[170px]">
                  {adminEmail}
                </span>
                <span className="bg-purple-50 text-purple-700 border border-purple-200 font-mono text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  FACULTY ADMIN
                </span>
              </div>

              {/* Mobile badge */}
              <span className="lg:hidden bg-purple-50 text-purple-700 border border-purple-200 font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full">
                FACULTY ADMIN
              </span>

              {/* "Switch to Student View" link */}
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-slate-100/80 hover:bg-indigo-50 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-indigo-200 transition-colors"
                title="Switch to Student Portal"
              >
                <span className="hidden sm:inline">Switch to Student View</span>
                <span className="sm:hidden">Student</span>
                <ArrowUpRight size={13} />
              </Link>

              {/* "Sign Out" button */}
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50/80 hover:bg-rose-100/80 px-3 py-1.5 rounded-xl border border-rose-200 transition-all active:scale-95"
                title="Sign out of Faculty Console"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>

          </div>

          {/* Sub-Navigation Tabs (Mobile Bar) */}
          <div className="md:hidden flex items-center gap-1 py-2 border-t border-slate-100 overflow-x-auto scrollbar-none">
            {navTabs.map((tab) => {
              const isActive = location.pathname === tab.path
              const Icon = tab.icon
              return (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                  }`}
                >
                  <Icon size={13} />
                  <span>{tab.name}</span>
                </NavLink>
              )
            })}
          </div>

        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 text-center text-xs text-slate-500 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CampusConnect Faculty Administration Portal • PostgreSQL ACID Row-Locks</span>
          <span className="font-mono text-[11px] text-slate-400">Strictly Restricted Faculty Access</span>
        </div>
      </footer>

      {/* Standard Toast Provider */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: 'bg-white border border-slate-200 text-slate-900 text-sm shadow-xl rounded-2xl',
          style: {
            background: '#ffffff',
            color: '#0f172a',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '12px 18px',
            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.08)'
          },
        }} 
      />
    </div>
  )
}

export default AdminLayout
