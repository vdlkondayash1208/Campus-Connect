import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, Users, BarChart3, LogOut, ShieldAlert, ArrowLeftRight, CheckCircle2 } from 'lucide-react'
import { signOut } from '../../services/api'

export const AdminSidebar = () => {
  const navigate = useNavigate()

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Events Management', path: '/admin/events', icon: CalendarDays },
    { name: 'Student Directory', path: '/admin/users', icon: Users },
    { name: 'Analytics & Insights', path: '/admin/analytics', icon: BarChart3 },
  ]

  const handleLogout = () => {
    signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shadow-sm z-20">
      {/* Admin Portal Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Faculty Portal
            </h1>
            <p className="text-[11px] text-rose-600 font-semibold uppercase tracking-wider">
              Super Admin
            </p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 font-mono">
          Management
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `group relative flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                isActive 
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-sm font-semibold' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg transition-colors ${
                    isActive ? 'bg-rose-500 text-white' : 'text-slate-400 group-hover:text-rose-600 group-hover:bg-rose-50'
                  }`}>
                    <item.icon size={18} />
                  </div>
                  <span>{item.name}</span>
                </div>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-rose-500 rounded-r-full" />
                )}
              </>
            )}
          </NavLink>
        ))}

        <div className="pt-4 mt-4 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 font-mono">
            Switch View
          </p>
          <NavLink
            to="/dashboard"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-100"
          >
            <ArrowLeftRight size={16} className="text-indigo-500" />
            <span>Go to Student View</span>
          </NavLink>
        </div>
      </nav>

      {/* System Status & Sign Out */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
        <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span className="text-slate-700 font-medium">FastAPI Engine</span>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
            8000 OK
          </span>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-3 py-2 w-full rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-all"
        >
          <LogOut size={14} />
          <span>Exit Faculty Mode</span>
        </button>
      </div>
    </aside>
  )
}
