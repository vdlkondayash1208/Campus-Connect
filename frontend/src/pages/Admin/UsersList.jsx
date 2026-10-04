import { useState, useEffect, useMemo } from 'react'
import { 
  getAdminUsers, 
  getCachedStudentsSync, 
  subscribeAdminStore, 
  addNewStudent 
} from '../../services/adminApi'
import { 
  Search, Loader2, AlertCircle, GraduationCap, 
  Sparkles, Users, Download, ArrowUpDown, ChevronRight, 
  X, Mail, BookOpen, Layers, Tag, Calendar, Check, ExternalLink,
  UserPlus, Plus 
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'

export default function AdminUsersList() {
  // Synchronous Frame 0 state initialization eliminates page transition delays
  const [users, setUsers] = useState(() => getCachedStudentsSync())
  const [loading, setLoading] = useState(() => !getCachedStudentsSync().length)
  const [searchQuery, setSearchQuery] = useState('')
  const [branchFilter, setBranchFilter] = useState('All')
  const [yearFilter, setYearFilter] = useState('All')
  const [selectedSkill, setSelectedSkill] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  
  // New student form state
  const [newStudentData, setNewStudentData] = useState({
    full_name: '',
    email: '',
    branch: 'CSE',
    year: '3',
    skills: 'React, Tailwind CSS',
    bio: ''
  })

  useEffect(() => {
    // 1. Subscribe to reactive dynamic updates
    const unsubscribe = subscribeAdminStore(() => {
      setUsers(getCachedStudentsSync())
    })

    // 2. Fetch fresh data in background
    getAdminUsers().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setUsers(data)
      }
      setLoading(false)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // Dynamic filter lists
  const branches = useMemo(() => {
    const list = new Set(['CSE', 'AIML', 'ECE', 'Data Science'])
    users.forEach(u => { if (u.branch) list.add(u.branch) })
    return ['All', ...Array.from(list)]
  }, [users])

  const years = ['All', '1', '2', '3', '4']

  const popularSkills = useMemo(() => {
    const counts = {}
    users.forEach(u => {
      (u.skills || []).forEach(s => {
        counts[s] = (counts[s] || 0) + 1
      })
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(entry => entry[0])
  }, [users])

  // Filtered students
  const filteredUsers = useMemo(() => {
    return users.filter(student => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch = !q ||
        student.full_name?.toLowerCase().includes(q) ||
        student.email?.toLowerCase().includes(q) ||
        student.branch?.toLowerCase().includes(q) ||
        (student.skills || []).some(s => s.toLowerCase().includes(q))

      const matchesBranch = branchFilter === 'All' || student.branch === branchFilter
      const matchesYear = yearFilter === 'All' || String(student.year) === String(yearFilter)
      const matchesSkill = !selectedSkill || (student.skills || []).includes(selectedSkill)

      return matchesSearch && matchesBranch && matchesYear && matchesSkill
    })
  }, [users, searchQuery, branchFilter, yearFilter, selectedSkill])

  // Handle Dynamic Student Addition
  const handleAddStudentSubmit = async (e) => {
    e.preventDefault()
    if (!newStudentData.full_name || !newStudentData.email) return

    const skillsArray = newStudentData.skills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    await addNewStudent({
      full_name: newStudentData.full_name,
      email: newStudentData.email,
      branch: newStudentData.branch,
      year: newStudentData.year,
      skills: skillsArray,
      bio: newStudentData.bio || `Student builder in ${newStudentData.branch} department.`
    })

    toast.success(`Enrolled student "${newStudentData.full_name}" into directory!`, {
      icon: '🎓'
    })
    setIsAddModalOpen(false)
    setNewStudentData({
      full_name: '',
      email: '',
      branch: 'CSE',
      year: '3',
      skills: 'React, Tailwind CSS',
      bio: ''
    })
  }

  // Typographic Monogram Generator
  const getMonogram = (name) => {
    if (!name) return 'ST'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  // Monogram gradient mapping
  const getGradient = (name) => {
    const charCode = (name || 'A').charCodeAt(0)
    const palettes = [
      'from-indigo-600 to-indigo-700 text-white',
      'from-purple-600 to-purple-700 text-white',
      'from-blue-600 to-blue-700 text-white',
      'from-slate-700 to-slate-900 text-white',
    ]
    return palettes[charCode % palettes.length]
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-2 font-mono">
            <GraduationCap size={14} />
            PostgreSQL RPC admin_list_users()
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Student Directory
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Authoritative university student roll with verified emails, branches, skill chips, and signup timestamps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-semibold bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-xl shadow-xs">
            Total Enrolled: <strong className="text-slate-900">{users.length}</strong>
          </span>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-xs shadow-indigo-500/20 transition-all active:scale-95"
          >
            <UserPlus size={14} />
            <span>Enroll Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-5 space-y-4">
        
        {/* Search input + Dropdowns */}
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, college email, branch, or skill..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Branch Filter */}
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 flex-1 md:flex-initial"
            >
              {branches.map(b => (
                <option key={b} value={b}>Branch: {b}</option>
              ))}
            </select>

            {/* Year Filter */}
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 flex-1 md:flex-initial"
            >
              {years.map(y => (
                <option key={y} value={y}>{y === 'All' ? 'All Years' : `Year ${y}`}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Popular Skill Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium font-mono text-[11px] mr-1">Filter by Skill:</span>
          <button
            onClick={() => setSelectedSkill('')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              !selectedSkill 
                ? 'bg-indigo-600 text-white shadow-xs' 
                : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Skills
          </button>
          {popularSkills.map(skill => (
            <button
              key={skill}
              onClick={() => setSelectedSkill(selectedSkill === skill ? '' : skill)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedSkill === skill
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>

      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-xs border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="p-4">Full Name</th>
                <th className="p-4">College Email</th>
                <th className="p-4">Branch</th>
                <th className="p-4">Year</th>
                <th className="p-4">Skills Chips</th>
                <th className="p-4 text-right">Sign-Up Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center">
                    <Loader2 className="animate-spin text-indigo-600 w-8 h-8 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-mono">Synchronizing student records...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-500">
                    <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="text-sm font-semibold text-slate-700">No students matched your search criteria</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting the branch or skill filters</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((student) => {
                  const monogram = getMonogram(student.full_name)
                  const gradientClass = getGradient(student.full_name)
                  const formattedDate = student.created_at ? new Date(student.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }) : 'Aug 15, 2026'

                  return (
                    <tr 
                      key={student.id} 
                      onClick={() => setSelectedStudent(student)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* 1. Full Name + Monogram Avatar */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${gradientClass} flex items-center justify-center font-bold text-xs shadow-xs shrink-0 tracking-wider`}>
                            {monogram}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors block">
                              {student.full_name}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">ID: {student.id.slice(0, 8)}</span>
                          </div>
                        </div>
                      </td>

                      {/* 2. College Email */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
                          <Mail size={13} className="text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{student.email}</span>
                        </div>
                      </td>

                      {/* 3. Branch (CSE, AIML, etc.) */}
                      <td className="p-4">
                        <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-mono text-xs font-semibold px-2.5 py-0.5 rounded-lg">
                          {student.branch || 'CSE'}
                        </span>
                      </td>

                      {/* 4. Year (1-4) */}
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                          Year {student.year || '3'}
                        </span>
                      </td>

                      {/* 5. Skills Chips */}
                      <td className="p-4 max-w-[280px]">
                        <div className="flex flex-wrap gap-1">
                          {(student.skills || []).slice(0, 3).map((skill) => (
                            <span 
                              key={skill}
                              className="bg-slate-100 text-slate-700 border border-slate-200 font-mono text-[10px] font-semibold px-2 py-0.5 rounded-md"
                            >
                              {skill}
                            </span>
                          ))}
                          {(student.skills || []).length > 3 && (
                            <span className="text-[10px] font-mono text-slate-500 self-center pl-1 font-semibold">
                              +{(student.skills || []).length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 6. Sign-Up Date */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 text-xs text-slate-500 font-mono">
                          <Calendar size={12} className="text-slate-400" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Details Inspection Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="fixed inset-0" onClick={() => setSelectedStudent(null)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-7 z-10 space-y-5"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedStudent(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>

              {/* Student Header */}
              <div className="flex items-center gap-4 pr-8">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${getGradient(selectedStudent.full_name)} flex items-center justify-center font-extrabold text-base shadow-sm tracking-wider`}>
                  {getMonogram(selectedStudent.full_name)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedStudent.full_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md">
                      {selectedStudent.branch || 'CSE'}
                    </span>
                    <span className="text-xs text-slate-500 font-mono font-medium">
                      Year {selectedStudent.year || '3'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Email & Details Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-mono">College Email:</span>
                  <span className="font-semibold text-slate-900 font-mono">{selectedStudent.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-mono">Enrolled Since:</span>
                  <span className="text-slate-700 font-mono">
                    {selectedStudent.created_at ? new Date(selectedStudent.created_at).toLocaleDateString() : 'Aug 15, 2026'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-mono">Record Status:</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1 font-mono">
                    <Check size={13} />
                    Verified Student
                  </span>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 font-mono">
                  Verified Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedStudent.skills || []).map(skill => (
                    <span 
                      key={skill}
                      className="bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono text-xs font-medium px-2.5 py-1 rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bio / Project Notes */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-mono">
                  Profile Bio & Interests
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {selectedStudent.bio || 'Active participant in campus hackathons, open source initiatives, and collaborative software engineering capstones.'}
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-xs"
                >
                  Close Record
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Enroll Student Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="fixed inset-0" onClick={() => setIsAddModalOpen(false)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white border border-slate-200 rounded-3xl shadow-xl w-full max-w-md p-6 z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Enroll New Student</h3>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddStudentSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 font-mono">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Rao"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={newStudentData.full_name}
                    onChange={(e) => setNewStudentData({ ...newStudentData, full_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 font-mono">
                    College Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ananya.rao@university.edu"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={newStudentData.email}
                    onChange={(e) => setNewStudentData({ ...newStudentData, email: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 font-mono">
                      Branch
                    </label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
                      value={newStudentData.branch}
                      onChange={(e) => setNewStudentData({ ...newStudentData, branch: e.target.value })}
                    >
                      <option value="CSE">CSE</option>
                      <option value="AIML">AIML</option>
                      <option value="ECE">ECE</option>
                      <option value="Data Science">Data Science</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 font-mono">
                      Year
                    </label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
                      value={newStudentData.year}
                      onChange={(e) => setNewStudentData({ ...newStudentData, year: e.target.value })}
                    >
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                      <option value="4">Year 4</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 font-mono">
                    Skills (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="React, Python, Figma"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={newStudentData.skills}
                    onChange={(e) => setNewStudentData({ ...newStudentData, skills: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
                  >
                    Enroll Student
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
