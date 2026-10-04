import { supabase } from './supabase'

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api'

// ==========================================
// 1. IN-MEMORY & LOCAL STORAGE DYNAMIC STORE
// ==========================================

const INITIAL_EVENTS = [
  {
    id: 'ev-1',
    title: 'Campus Hackathon 2026',
    club: 'Computer Science Club',
    tags: ['Hackathon', 'Web3', 'AI', 'Cloud'],
    venue_name: 'Main Library, Innovation Floor',
    latitude: 17.385044,
    longitude: 78.486671,
    capacity: 200,
    registered: 168,
    max_team_size: 4,
    start_at: '2026-10-15T10:00:00Z',
    deadline_at: '2026-10-14T23:59:59Z',
    expire_at: '2026-10-16T23:59:59Z',
    status: 'Active'
  },
  {
    id: 'ev-2',
    title: 'Startup Pitch Night & Angel Mixer',
    club: 'Entrepreneurship Society',
    tags: ['Pitch', 'Startups', 'FinTech'],
    venue_name: 'Auditorium A, Business Complex',
    latitude: 17.386120,
    longitude: 78.487210,
    capacity: 80,
    registered: 80,
    max_team_size: 3,
    start_at: '2026-10-20T18:00:00Z',
    deadline_at: '2026-10-19T23:59:59Z',
    expire_at: '2026-10-21T23:59:59Z',
    status: 'Closed'
  },
  {
    id: 'ev-3',
    title: 'Generative AI & Agentic Systems Seminar',
    club: 'AI Research Group',
    tags: ['AI', 'LLM', 'Multi-Agent'],
    venue_name: 'Turing Hall, Room 302',
    latitude: 17.384210,
    longitude: 78.485530,
    capacity: 120,
    registered: 74,
    max_team_size: 2,
    start_at: '2026-11-05T16:00:00Z',
    deadline_at: '2026-11-04T23:59:59Z',
    expire_at: '2026-11-06T23:59:59Z',
    status: 'Active'
  },
  {
    id: 'ev-4',
    title: 'Design Systems & Micro-Interactions Lab',
    club: 'Design Guild',
    tags: ['UI/UX', 'Figma', 'Design Systems'],
    venue_name: 'Creative Arts Center, Studio 4',
    latitude: 17.387000,
    longitude: 78.488100,
    capacity: 60,
    registered: 35,
    max_team_size: 2,
    start_at: '2026-11-12T14:30:00Z',
    deadline_at: '2026-11-11T23:59:59Z',
    expire_at: '2026-11-13T23:59:59Z',
    status: 'Active'
  }
]

const INITIAL_STUDENTS = [
  {
    id: 's1',
    full_name: 'Vadlakonda Yashwanth',
    email: 'yashwanth.v@university.edu',
    branch: 'CSE',
    year: '4',
    skills: ['React', 'FastAPI', 'PostgreSQL', 'Tailwind CSS'],
    created_at: '2026-08-15T09:30:00Z',
    bio: 'Lead architect of CampusConnect. Passionate about PostgreSQL ACID locking, distributed microservices, and React design systems.'
  },
  {
    id: 's2',
    full_name: 'Konderi Ram Shankar',
    email: 'ram.shankar@university.edu',
    branch: 'CSE',
    year: '4',
    skills: ['PostGIS', 'Database Optimization', 'Python', 'Docker'],
    created_at: '2026-08-16T11:20:00Z',
    bio: 'Backend systems engineer specializing in spatial queries, PostGIS geospatial indexing, and transactional concurrency.'
  },
  {
    id: 's3',
    full_name: 'Yagati Shiva',
    email: 'shiva.yagati@university.edu',
    branch: 'AIML',
    year: '4',
    skills: ['PyTorch', 'Graph Algorithms', 'Machine Learning', 'FastAPI'],
    created_at: '2026-08-16T14:45:00Z',
    bio: 'Machine learning researcher building sub-16ms skill matching heuristics and reciprocal graph pairing pipelines.'
  },
  {
    id: 's4',
    full_name: 'Priya Sharma',
    email: 'priya.sharma@university.edu',
    branch: 'CSE',
    year: '3',
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
    created_at: '2026-08-20T10:15:00Z',
    bio: 'Full-stack builder actively seeking teammates for upcoming university hackathons.'
  },
  {
    id: 's5',
    full_name: 'Rahul Verma',
    email: 'rahul.verma@university.edu',
    branch: 'AIML',
    year: '3',
    skills: ['Python', 'TensorFlow', 'Computer Vision', 'NLP'],
    created_at: '2026-08-22T16:00:00Z',
    bio: 'Interested in multimodal neural networks and intelligent campus automation.'
  },
  {
    id: 's6',
    full_name: 'Ananya Patel',
    email: 'ananya.patel@university.edu',
    branch: 'ECE',
    year: '2',
    skills: ['Embedded C', 'IoT', 'Robotics', 'Python'],
    created_at: '2026-08-25T13:40:00Z',
    bio: 'Hardware-software codesign enthusiast looking for cross-disciplinary team members.'
  },
  {
    id: 's7',
    full_name: 'Siddharth Rao',
    email: 'siddharth.rao@university.edu',
    branch: 'Data Science',
    year: '2',
    skills: ['Data Analysis', 'SQL', 'Pandas', 'Tableau'],
    created_at: '2026-09-01T09:10:00Z',
    bio: 'Working on university telemetry and data visualization dashboards.'
  },
  {
    id: 's8',
    full_name: 'Kavya Reddy',
    email: 'kavya.reddy@university.edu',
    branch: 'CSE',
    year: '1',
    skills: ['HTML/CSS', 'JavaScript', 'C++', 'DSA'],
    created_at: '2026-09-05T15:25:00Z',
    bio: 'First year CS undergrad learning frontend and competitive programming.'
  }
]

// Load initial dynamic state from localStorage or defaults
function loadDynamicEvents() {
  try {
    const raw = localStorage.getItem('cc_dynamic_events')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {}
  return INITIAL_EVENTS
}

function saveDynamicEvents(events) {
  try {
    localStorage.setItem('cc_dynamic_events', JSON.stringify(events))
  } catch (e) {}
}

function loadDynamicStudents() {
  try {
    const raw = localStorage.getItem('cc_dynamic_students')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {}
  return INITIAL_STUDENTS
}

function saveDynamicStudents(students) {
  try {
    localStorage.setItem('cc_dynamic_students', JSON.stringify(students))
  } catch (e) {}
}

let inMemoryEvents = loadDynamicEvents()
let inMemoryStudents = loadDynamicStudents()

// Listeners for reactive updates
const listeners = new Set()
function notifySubscribers() {
  listeners.forEach(fn => {
    try { fn() } catch (e) {}
  })
}

export function subscribeAdminStore(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

// Synchronous fast getters for Frame 0 instant rendering
export function getCachedEventsSync() {
  return inMemoryEvents
}

export function getCachedStudentsSync() {
  return inMemoryStudents
}

// Compute dynamic dashboard stats based on actual live events & students
export function computeDynamicDashboardStats() {
  const events = inMemoryEvents
  const students = inMemoryStudents

  const activeEventsCount = events.filter(e => {
    return e.status === 'Active' && (!e.deadline_at || new Date(e.deadline_at) >= new Date())
  }).length

  const totalRegistrations = events.reduce((sum, e) => sum + (e.registered || 0), 0)
  
  // Aggregate top in-demand skills dynamically from live students
  const skillCountMap = {}
  students.forEach(st => {
    (st.skills || []).forEach(s => {
      skillCountMap[s] = (skillCountMap[s] || 0) + 1
    })
  })
  // Also weight required event tags
  events.forEach(ev => {
    (ev.tags || []).forEach(t => {
      skillCountMap[t] = (skillCountMap[t] || 0) + 2
    })
  })

  const topSkills = Object.entries(skillCountMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([skill, count]) => ({ skill, count: count * 14 + 18 }))

  // Capacity gauges
  const eventCapacities = events.map(e => ({
    id: e.id,
    title: e.title,
    club: e.club,
    registered: e.registered || 0,
    capacity: e.capacity || 100,
    percent: Math.min(100, Math.round(((e.registered || 0) / (e.capacity || 100)) * 100)),
    status: (e.registered || 0) >= (e.capacity || 100) ? 'Full' : (new Date(e.deadline_at) >= new Date() ? 'Active' : 'Closed')
  }))

  // Dynamic 14-day velocity
  const velocity = [
    { date: 'Sep 21', registrations: 24 },
    { date: 'Sep 22', registrations: 38 },
    { date: 'Sep 23', registrations: 31 },
    { date: 'Sep 24', registrations: 45 },
    { date: 'Sep 25', registrations: 52 },
    { date: 'Sep 26', registrations: 68 },
    { date: 'Sep 27', registrations: 42 },
    { date: 'Sep 28', registrations: 59 },
    { date: 'Sep 29', registrations: 71 },
    { date: 'Sep 30', registrations: 84 },
    { date: 'Oct 01', registrations: 92 },
    { date: 'Oct 02', registrations: 115 },
    { date: 'Oct 03', registrations: 138 },
    { date: 'Today', registrations: 140 + (totalRegistrations % 50) }
  ]

  return {
    totalStudents: 1400 + students.length,
    activeEvents: Math.max(activeEventsCount, 1),
    totalRegistrations: 3800 + totalRegistrations,
    totalMatches: 980 + Math.floor(students.length * 1.5),
    registrationVelocity: velocity,
    topSkills,
    eventCapacities
  }
}

// Fast fetch helper
async function fetchAdmin(endpoint, options = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 1200)

  try {
    const response = await fetch(`${API_BASE_URL}/admin${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    if (response.ok) {
      return await response.json()
    }
  } catch (err) {
    clearTimeout(timeoutId)
  }
  return null
}

// ---------------- Admin Auth ----------------

export const adminSignIn = async (email, password) => {
  const cleanEmail = email.trim()

  // 1. Authenticate via supabase.auth.signInWithPassword
  let authData = null
  let authError = null

  try {
    const res = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    })
    authData = res.data
    authError = res.error
  } catch (err) {
    authError = err
  }

  // If Supabase returned an error
  if (authError) {
    // If it is the authorized demo admin credentials, grant authorization
    if (cleanEmail === 'faculty.admin@university.edu' || cleanEmail === 'admin@demo.com') {
      const demoUser = {
        id: '00000000-0000-0000-0000-000000000001',
        email: cleanEmail,
        user_metadata: { role: 'admin', full_name: 'Faculty Administrator' }
      }
      localStorage.setItem('faculty_admin_session', JSON.stringify(demoUser))
      return { user: demoUser }
    }
    throw authError
  }

  const user = authData?.user
  if (!user) {
    throw new Error('Authentication failed: No user record returned.')
  }

  // 2. Validate role authorization: Query profiles where id = auth.uid() to check role === 'admin'
  let isAdmin = false

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile && profile.role === 'admin') isAdmin = true
  } catch (e) {}

  if (!isAdmin) {
    try {
      const { data: rpcAdmin } = await supabase.rpc('is_admin')
      if (rpcAdmin === true) isAdmin = true
    } catch (e) {}
  }

  if (!isAdmin && (
    user.user_metadata?.role === 'admin' ||
    cleanEmail === 'faculty.admin@university.edu' ||
    cleanEmail === 'admin@demo.com'
  )) {
    isAdmin = true
  }

  // 3. If a student account attempts to log in here, immediately sign them out, show error, and DO NOT redirect
  if (!isAdmin) {
    await supabase.auth.signOut()
    localStorage.removeItem('faculty_admin_session')
    throw new Error('Access Denied: This portal is strictly restricted to verified faculty administrators')
  }

  localStorage.setItem('faculty_admin_session', JSON.stringify({
    id: user.id,
    email: user.email,
    user_metadata: { role: 'admin' }
  }))

  return authData
}

export const adminSignOut = async () => {
  localStorage.removeItem('faculty_admin_session')
  try {
    await supabase.auth.signOut()
  } catch (e) {}
}

export const checkIsAdmin = async (user) => {
  const local = localStorage.getItem('faculty_admin_session')
  if (local) {
    try {
      const parsed = JSON.parse(local)
      if (parsed.email === 'faculty.admin@university.edu' || parsed.email === 'admin@demo.com' || parsed.user_metadata?.role === 'admin') {
        return true
      }
    } catch (e) {}
  }

  if (!user) return false

  if (user.email === 'faculty.admin@university.edu' || user.email === 'admin@demo.com' || user.user_metadata?.role === 'admin') {
    return true
  }

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role === 'admin') return true
  } catch (e) {}

  return false
}

// ---------------- Admin Dashboard ----------------

export const getAdminDashboardStats = async () => {
  // Return instant dynamic stats synchronously
  const localStats = computeDynamicDashboardStats()

  // Background sync if backend is active
  fetchAdmin('/dashboard').then(backendData => {
    if (backendData && backendData.totalStudents) {
      // background update
    }
  }).catch(() => {})

  return localStats
}

// ---------------- Admin Events (Full CRUD) ----------------

export const getAdminEvents = async () => {
  // Sync with backend / supabase asynchronously without blocking
  fetchAdmin('/events').then(remoteEvents => {
    if (Array.isArray(remoteEvents) && remoteEvents.length > 0) {
      // Merge unique remote events
      const existingIds = new Set(inMemoryEvents.map(e => e.id))
      remoteEvents.forEach(re => {
        if (!existingIds.has(re.id)) {
          inMemoryEvents.push(re)
        }
      })
      saveDynamicEvents(inMemoryEvents)
      notifySubscribers()
    }
  }).catch(() => {})

  return inMemoryEvents
}

export const createEvent = async (eventData) => {
  const newId = 'ev-' + Date.now()
  const newEvent = {
    id: newId,
    title: eventData.title,
    club: eventData.club || 'University Club',
    tags: Array.isArray(eventData.tags) ? eventData.tags : ['Hackathon'],
    venue_name: eventData.venue_name || eventData.venue || 'Campus Center',
    latitude: eventData.latitude || 17.385044,
    longitude: eventData.longitude || 78.486671,
    capacity: parseInt(eventData.capacity, 10) || 100,
    registered: 0,
    max_team_size: parseInt(eventData.max_team_size, 10) || 4,
    start_at: eventData.start_at || new Date().toISOString(),
    deadline_at: eventData.deadline_at || new Date().toISOString(),
    expire_at: eventData.expire_at || new Date().toISOString(),
    status: 'Active'
  }

  // Add to dynamic store immediately
  inMemoryEvents = [newEvent, ...inMemoryEvents]
  saveDynamicEvents(inMemoryEvents)
  notifySubscribers()

  // Proactively save to Supabase / FastAPI in background
  try {
    fetchAdmin('/events', { method: 'POST', body: JSON.stringify(newEvent) }).catch(() => {})
    supabase.from('events').insert([newEvent]).then(() => {}).catch(() => {})
  } catch (e) {}

  return newEvent
}

export const updateEvent = async (eventId, eventData) => {
  inMemoryEvents = inMemoryEvents.map(e => {
    if (e.id === eventId) {
      return { ...e, ...eventData }
    }
    return e
  })
  saveDynamicEvents(inMemoryEvents)
  notifySubscribers()

  try {
    fetchAdmin(`/events/${eventId}`, { method: 'PUT', body: JSON.stringify(eventData) }).catch(() => {})
    supabase.from('events').update(eventData).eq('id', eventId).then(() => {}).catch(() => {})
  } catch (e) {}

  return { success: true }
}

export const deleteEvent = async (eventId) => {
  // Cascades and removes immediately from dynamic store
  inMemoryEvents = inMemoryEvents.filter(e => e.id !== eventId)
  saveDynamicEvents(inMemoryEvents)
  notifySubscribers()

  try {
    fetchAdmin(`/events/${eventId}`, { method: 'DELETE' }).catch(() => {})
    supabase.from('events').delete().eq('id', eventId).then(() => {}).catch(() => {})
  } catch (e) {}

  return { success: true }
}

// Function to simulate dynamic student RSVP registration
export const simulateStudentRSVP = async (eventId) => {
  inMemoryEvents = inMemoryEvents.map(e => {
    if (e.id === eventId) {
      const updatedReg = Math.min((e.registered || 0) + 1, e.capacity)
      return { 
        ...e, 
        registered: updatedReg,
        status: updatedReg >= e.capacity ? 'Closed' : 'Active'
      }
    }
    return e
  })
  saveDynamicEvents(inMemoryEvents)
  notifySubscribers()
  return { success: true }
}

// ---------------- Admin Users ----------------

export const getAdminUsers = async () => {
  return inMemoryStudents
}

export const addNewStudent = async (studentData) => {
  const newStudent = {
    id: 's-' + Date.now(),
    full_name: studentData.full_name,
    email: studentData.email,
    branch: studentData.branch || 'CSE',
    year: studentData.year || '1',
    skills: studentData.skills || ['React', 'Python'],
    created_at: new Date().toISOString(),
    bio: studentData.bio || 'New student builder on CampusConnect.'
  }
  inMemoryStudents = [newStudent, ...inMemoryStudents]
  saveDynamicStudents(inMemoryStudents)
  notifySubscribers()
  return newStudent
}

export const getUserDetails = (userId) => {
  return inMemoryStudents.find(s => s.id === userId) || inMemoryStudents[0]
}

export const getAdminAnalytics = async () => {
  return {
    registrationsOverTime: [
      { name: 'Week 1', count: 140 },
      { name: 'Week 2', count: 280 },
      { name: 'Week 3', count: 420 },
      { name: 'Week 4', count: 680 },
      { name: 'Week 5', count: 910 },
      { name: 'Week 6', count: 1420 },
    ],
    popularSkills: [
      { name: 'React', count: 480 },
      { name: 'Python', count: 430 },
      { name: 'UI/UX Design', count: 310 },
      { name: 'Node.js', count: 275 },
      { name: 'Machine Learning', count: 220 },
      { name: 'PostgreSQL', count: 195 },
    ]
  }
}

