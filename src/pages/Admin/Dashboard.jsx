import { useState, useEffect } from 'react'
import { 
  getAdminDashboardStats, 
  computeDynamicDashboardStats, 
  subscribeAdminStore, 
  simulateStudentRSVP 
} from '../../services/adminApi'
import { 
  Users, CalendarDays, Ticket, MessageCircle, Loader2, 
  TrendingUp, Sparkles, ShieldCheck, ArrowUpRight, Plus, 
  RefreshCw, Layers, CheckCircle2, AlertTriangle, Flame,
  Zap, ArrowRight
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'

export default function AdminDashboard() {
  // Synchronous Frame 0 state initialization for 0ms perceptible navigation latency
  const [stats, setStats] = useState(() => computeDynamicDashboardStats())
  const [refreshing, setRefreshing] = useState(false)
  const [chartType, setChartType] = useState('area') // 'area' | 'bar'

  useEffect(() => {
    // 1. Subscribe to reactive dynamic store updates (e.g. when events are created or deleted)
    const unsubscribe = subscribeAdminStore(() => {
      setStats(computeDynamicDashboardStats())
    })

    // 2. Fetch fresh stats in background
    getAdminDashboardStats().then(data => {
      if (data) setStats(data)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    const fresh = await getAdminDashboardStats()
    setStats(fresh)
    setRefreshing(false)
    toast.success('Analytics synchronized via PostgreSQL RPC')
  }

  const handleSimulateRSVP = (eventId, eventTitle) => {
    simulateStudentRSVP(eventId)
    toast.success(`Simulated student RSVP for "${eventTitle}". Gauge updated!`, {
      icon: '⚡'
    })
  }

  // 4 Top Metric Cards Specification
  const statCards = [
    { 
      title: 'Total Registered Students', 
      value: stats.totalStudents.toLocaleString(), 
      subtitle: 'Enrolled in Campus Directory', 
      icon: Users, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50 border-indigo-200/80',
      badge: '+14% this term',
      link: '/admin/users'
    },
    { 
      title: 'Active Events', 
      value: stats.activeEvents.toLocaleString(), 
      subtitle: 'Open Registration Deadlines', 
      icon: CalendarDays, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50 border-purple-200/80',
      badge: 'Live & Discoverable',
      link: '/admin/events'
    },
    { 
      title: 'Total Registrations', 
      value: stats.totalRegistrations.toLocaleString(), 
      subtitle: 'Guaranteed Allocated Seats', 
      icon: Ticket, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50 border-emerald-200/80',
      badge: '92% Avg Fill Rate',
      link: '/admin/events'
    },
    { 
      title: 'Confirmed Teammate Matches', 
      value: stats.totalMatches.toLocaleString(), 
      subtitle: 'Reciprocal Teammate Swipes', 
      icon: MessageCircle, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50 border-amber-200/80',
      badge: '+34 This Week',
      link: '/admin/users'
    },
  ]

  const topSkills = stats.topSkills || []
  const maxSkillCount = Math.max(...topSkills.map(s => s.count), 1)
  const velocityData = stats.registrationVelocity || []
  const eventCapacities = stats.eventCapacities || []

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-2 font-mono">
            <ShieldCheck size={14} />
            PostgreSQL RPC admin_dashboard()
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Faculty Governance Dashboard
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Live telemetry with instant dynamic synchronization across student profiles, event capacities, and skill graphs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-60"
            title="Refresh database analytics"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin text-indigo-600' : ''} />
            <span>Sync Engine</span>
          </button>

          <Link 
            to="/admin/events" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-xs shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Plus size={15} />
            <span>New Campus Event</span>
          </Link>
        </div>
      </div>

      {/* 1. Top Metric Cards (Grid of 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat) => (
          <Link 
            key={stat.title} 
            to={stat.link}
            className="bg-white border border-slate-200 shadow-xs rounded-2xl p-6 hover:border-indigo-300 hover:shadow-sm transition-all duration-200 group block relative"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl border ${stat.bg} ${stat.color} transition-transform group-hover:scale-105`}>
                <stat.icon size={22} />
              </div>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-full group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors">
                {stat.badge}
              </span>
            </div>
            
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {stat.title}
            </p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
              {stat.value}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 flex items-center justify-between">
              <span>{stat.subtitle}</span>
              <ArrowUpRight size={14} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </p>
          </Link>
        ))}
      </div>

      {/* 2. Interactive Visualizations Section: 14-Day Registration Velocity */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200/60">
                <TrendingUp size={16} />
              </span>
              <h2 className="text-lg font-bold text-slate-900">14-Day Registration Velocity</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Live registration progression across active campus hackathons and student team formations.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                chartType === 'area'
                  ? 'bg-white text-indigo-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Smooth Curve
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                chartType === 'bar'
                  ? 'bg-white text-indigo-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily Volume
            </button>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={velocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderColor: '#e2e8f0', 
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#0f172a',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)'
                  }}
                  formatter={(value) => [`${value} Registrations`, 'Daily Registrations']}
                />
                <Area 
                  type="monotone" 
                  dataKey="registrations" 
                  stroke="#4f46e5" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#velocityGradient)" 
                />
              </AreaChart>
            ) : (
              <BarChart data={velocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderColor: '#e2e8f0', 
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#0f172a',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)'
                  }}
                  formatter={(value) => [`${value} Registrations`, 'Daily Registrations']}
                />
                <Bar dataKey="registrations" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Two-Column Row: Top In-Demand Skills & Event Capacity Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top In-Demand Skills Horizontal Ranking Bar */}
        <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-200/60">
                    <Flame size={16} />
                  </span>
                  <h2 className="text-base font-bold text-slate-900">Top In-Demand Skills</h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Derived dynamically from <code className="font-mono text-purple-700 bg-purple-50 px-1 py-0.5 rounded">v_skill_demand</code>.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full font-mono">
                LIVE HEURISTIC
              </span>
            </div>

            <div className="space-y-4">
              {topSkills.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <Flame size={28} className="mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                  <p className="font-semibold text-slate-600">No skill telemetry recorded yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Enrolled student skills will aggregate here automatically.</p>
                </div>
              ) : (
                topSkills.map((item, index) => {
                  const percent = Math.round((item.count / maxSkillCount) * 100)
                  return (
                    <div key={item.skill} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 text-center font-mono font-bold text-slate-400 text-[11px]">
                            #{index + 1}
                          </span>
                          <span className="font-semibold text-slate-800">{item.skill}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-slate-600">{item.count} builders</span>
                          <span className="text-[10px] text-slate-400 font-mono">({percent}%)</span>
                        </div>
                      </div>
                      
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div className="pt-5 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Synchronized with student directory skills</span>
            <Link to="/admin/users" className="text-indigo-600 font-semibold hover:underline">
              Inspect student directory →
            </Link>
          </div>
        </div>

        {/* Event Capacity Overview Progress List with visual fill gauges & live simulate RSVP */}
        <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                    <Layers size={16} />
                  </span>
                  <h2 className="text-base font-bold text-slate-900">Event Capacity Overview</h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Enforces ACID row-level allocation. Click <strong className="text-indigo-600">+RSVP</strong> to simulate live student signups.
                </p>
              </div>
              <Link 
                to="/admin/events" 
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline shrink-0"
              >
                Manage events
              </Link>
            </div>

            <div className="space-y-4">
              {eventCapacities.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <Layers size={28} className="mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                  <p className="font-semibold text-slate-600">No active events yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Created campus events and capacity gauges will appear here.</p>
                </div>
              ) : (
                eventCapacities.map((event) => {
                  const percent = event.percent || Math.min(100, Math.round(((event.registered || 0) / event.capacity) * 100))
                  const isFull = (event.registered || 0) >= event.capacity
                  const isNearFull = percent >= 80

                  return (
                    <div key={event.id} className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 space-y-2 transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-tight">{event.title}</h4>
                          <span className="text-[11px] text-slate-500">{event.club}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          {isFull ? (
                            <span className="bg-rose-50 text-rose-700 border border-rose-200 font-semibold text-[10px] px-2 py-0.5 rounded-full">
                              Full Capacity
                            </span>
                          ) : event.status === 'Closed' ? (
                            <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                              Closed
                            </span>
                          ) : (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                              Active
                            </span>
                          )}

                          {/* Interactive Dynamic Simulation Button */}
                          {!isFull && (
                            <button
                              onClick={() => handleSimulateRSVP(event.id, event.title)}
                              className="bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-indigo-600 font-bold text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 transition-all shadow-2xs active:scale-95"
                              title="Simulate live student registration"
                            >
                              <Zap size={10} />
                              <span>+RSVP</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-600 font-semibold">
                          {event.registered} / {event.capacity} seats
                        </span>
                        <span className={`text-[11px] font-bold ${
                          isFull ? 'text-rose-600' : isNearFull ? 'text-amber-600' : 'text-slate-700'
                        }`}>
                          {percent}% filled
                        </span>
                      </div>

                      {/* Visual Fill Gauge */}
                      <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            isFull 
                              ? 'bg-rose-500' 
                              : isNearFull 
                              ? 'bg-amber-500' 
                              : 'bg-indigo-600'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div className="pt-5 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-500" />
              <span>Row-Level ACID Locks Enforced</span>
            </span>
            <Link to="/admin/events" className="text-indigo-600 font-semibold hover:underline">
              View all capacities →
            </Link>
          </div>
        </div>

      </div>

    </div>
  )
}
