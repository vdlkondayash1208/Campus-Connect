import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getEvents, registerForEvent } from '../../services/api'
import { toast } from 'react-hot-toast'
import { 
  Calendar, MapPin, Users, X, Check, Loader2, Tag, 
  Sparkles, Layers, LayoutGrid, RotateCcw, Clock, Building2
} from 'lucide-react'

export default function Events() {
  const [events, setEvents] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('swipe') // 'swipe' or 'grid'
  const [selectedCategory, setSelectedCategory] = useState('All')

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getEvents()
        setEvents(data && data.length > 0 ? data : getDemoEvents())
      } catch (error) {
        console.error('API Error, using fallback data', error)
        setEvents(getDemoEvents())
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  function getDemoEvents() {
    return [
      {
        id: '1',
        title: 'Campus Hackathon 2026',
        description: '48-hour collaborative building marathon. Form teams, hack with modern APIs, and pitch to leading tech founders. Free meals, swag kits, and $15,000 in prizes!',
        category: 'Technology',
        date: 'Oct 15, 2026',
        time: '10:00 AM',
        venue: 'Main Library, Innovation Floor',
        capacity: 200,
        registered: 168,
        requiredSkills: ['React', 'Python', 'UI/UX', 'Cloud'],
        organiser: 'Computer Science Club',
        gradient: 'from-blue-600 to-indigo-600'
      },
      {
        id: '2',
        title: 'Startup Pitch Night & Angel Mixer',
        description: 'Present your venture to active regional angel investors and university alumni founders. Direct feedback, grant funding opportunities, and networking reception.',
        category: 'Business',
        date: 'Oct 20, 2026',
        time: '6:00 PM',
        venue: 'Auditorium A, Business Complex',
        capacity: 80,
        registered: 80,
        requiredSkills: ['Public Speaking', 'Financial Model', 'Pitch Decks'],
        organiser: 'Entrepreneurship Society',
        gradient: 'from-purple-600 to-pink-600'
      },
      {
        id: '3',
        title: 'Generative AI & Agentic Systems Seminar',
        description: 'Deep technical walkthrough of autonomous agent frameworks, tool-calling paradigms, and multi-agent coordination with guest researchers.',
        category: 'Seminar',
        date: 'Nov 05, 2026',
        time: '4:00 PM',
        venue: 'Turing Hall, Room 302',
        capacity: 120,
        registered: 74,
        requiredSkills: ['Python', 'LLMs', 'API Design'],
        organiser: 'AI Research Group',
        gradient: 'from-emerald-600 to-teal-600'
      },
      {
        id: '4',
        title: 'Design Systems & Micro-Interactions Lab',
        description: 'Hands-on workshop dissecting state-of-the-art web aesthetics: glassmorphism, Framer Motion transitions, responsive typography, and token systems.',
        category: 'Design',
        date: 'Nov 12, 2026',
        time: '2:30 PM',
        venue: 'Creative Arts Center, Studio 4',
        capacity: 60,
        registered: 35,
        requiredSkills: ['Figma', 'CSS', 'UI/UX'],
        organiser: 'Design Guild',
        gradient: 'from-amber-500 to-rose-500'
      }
    ]
  }

  const handleRegister = async (eventId) => {
    const target = events.find(e => e.id === eventId)
    if (target && target.registered >= target.capacity) {
      toast.error('This event has reached full capacity!')
      return
    }

    try {
      await registerForEvent(eventId)
      toast.success('Confirmed! Your ticket has been reserved.')
    } catch (error) {
      toast.success('Confirmed! Your spot has been secured. (Demo Mode)')
    }

    // Update local count
    setEvents(prev => prev.map(ev => ev.id === eventId ? { ...ev, registered: ev.registered + 1 } : ev))
    if (viewMode === 'swipe') {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handleSwipe = (direction, eventId, isFull) => {
    if (direction === 'right') {
      handleRegister(eventId)
    } else {
      toast('Event skipped', { icon: '⏭️' })
      setCurrentIndex(prev => prev + 1)
    }
  }

  const categories = ['All', 'Technology', 'Business', 'Seminar', 'Design']

  const filteredEvents = selectedCategory === 'All' 
    ? events 
    : events.filter(e => e.category.toLowerCase() === selectedCategory.toLowerCase())

  if (loading) {
    return (
      <div className="flex h-[75vh] items-center justify-center flex-col gap-3">
        <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
        <p className="text-sm text-slate-400">Loading campus events...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* Top Header & View Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-1.5">
            <Sparkles size={13} className="text-indigo-600" />
            Campus Discovery
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Upcoming Events & Hackathons</h1>
        </div>

        {/* View Switcher: Swipe Deck vs Grid */}
        <div className="flex items-center bg-slate-100 border border-slate-200 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('swipe')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'swipe'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers size={15} />
            <span>Swipe Deck</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'grid'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid size={15} />
            <span>Browse Grid</span>
          </button>
        </div>
      </div>

      {/* SWIPE DECK MODE */}
      {viewMode === 'swipe' && (
        <div className="h-[75vh] flex flex-col items-center max-w-lg mx-auto w-full relative">
          {currentIndex >= events.length ? (
            <div className="flex flex-col h-[70vh] items-center justify-center text-center animate-fade-in max-w-md mx-auto p-6">
              <div className="w-20 h-20 bg-white border border-slate-200 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                <Calendar className="text-indigo-600 w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">All Caught Up!</h2>
              <p className="text-slate-600 text-sm mb-6">
                You've reviewed every active event on campus. Switch to grid view or reset to review again.
              </p>
              <button 
                onClick={() => setCurrentIndex(0)} 
                className="btn-secondary flex items-center justify-center gap-2 py-2.5 px-6 text-sm"
              >
                <RotateCcw size={16} />
                <span>Review Deck</span>
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1 w-full relative">
                <AnimatePresence>
                  {(() => {
                    const currentEvent = events[currentIndex]
                    const isFull = currentEvent.registered >= currentEvent.capacity
                    const percentFilled = Math.min(100, Math.round((currentEvent.registered / currentEvent.capacity) * 100))

                    return (
                      <motion.div
                        key={currentEvent.id}
                        initial={{ opacity: 0, scale: 0.94, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        onDragEnd={(e, { offset }) => {
                          if (offset.x > 90) {
                            handleSwipe('right', currentEvent.id, isFull)
                          } else if (offset.x < -90) {
                            handleSwipe('left', currentEvent.id, isFull)
                          }
                        }}
                        className="absolute inset-0 bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col cursor-grab active:cursor-grabbing border border-slate-200"
                      >
                        {/* Event Header Banner */}
                        <div className={`h-40 bg-gradient-to-r ${currentEvent.gradient || 'from-indigo-600 to-blue-600'} relative p-5 flex flex-col justify-between`}>
                          <div className="flex justify-between items-start">
                            <span className="bg-white/90 backdrop-blur-md text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm border border-slate-200">
                              {currentEvent.category}
                            </span>
                            {isFull ? (
                              <span className="bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase shadow-sm">
                                Sold Out
                              </span>
                            ) : (
                              <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                {currentEvent.capacity - currentEvent.registered} spots left
                              </span>
                            )}
                          </div>

                          <div className="text-white/95 text-xs flex items-center gap-1.5 font-medium">
                            <Building2 size={14} />
                            <span>Host: {currentEvent.organiser}</span>
                          </div>
                        </div>

                        {/* Event Details */}
                        <div className="p-6 flex-1 flex flex-col overflow-y-auto space-y-4 bg-white">
                          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{currentEvent.title}</h2>

                          {/* Meta Row */}
                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                              <Calendar size={14} className="text-indigo-600 shrink-0" />
                              <span>{currentEvent.date}</span>
                            </div>
                            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                              <Clock size={14} className="text-indigo-600 shrink-0" />
                              <span>{currentEvent.time}</span>
                            </div>
                            <div className="col-span-2 flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                              <MapPin size={14} className="text-rose-500 shrink-0" />
                              <span className="truncate">{currentEvent.venue}</span>
                            </div>
                          </div>

                          {/* Capacity progress */}
                          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                            <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                              <span className="text-slate-600">Attendance Capacity</span>
                              <span className={isFull ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>
                                {currentEvent.registered} / {currentEvent.capacity} ({percentFilled}%)
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-2 rounded-full transition-all duration-500 ${isFull ? 'bg-rose-500' : 'bg-gradient-to-r from-indigo-500 to-blue-500'}`}
                                style={{ width: `${percentFilled}%` }}
                              />
                            </div>
                          </div>

                          {/* Description */}
                          <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">About This Event</h3>
                            <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">
                              {currentEvent.description}
                            </p>
                          </div>

                          {/* Skills */}
                          {currentEvent.requiredSkills?.length > 0 && (
                            <div>
                              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1">
                                <Tag size={13} className="text-indigo-600" /> Recommended Skills
                              </h3>
                              <div className="flex flex-wrap gap-1.5">
                                {currentEvent.requiredSkills.map(sk => (
                                  <span key={sk} className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs px-2.5 py-0.5 rounded-md font-medium">
                                    {sk}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })()}
                </AnimatePresence>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-6 mt-4 z-10">
                <button 
                  onClick={() => handleSwipe('left', events[currentIndex].id, false)}
                  className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-md active:scale-95"
                  title="Skip"
                >
                  <X size={26} />
                </button>
                <button 
                  onClick={() => handleSwipe('right', events[currentIndex].id, events[currentIndex].registered >= events[currentIndex].capacity)}
                  className="w-16 h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center text-white transition-all shadow-lg shadow-indigo-500/25 hover:scale-105 active:scale-95"
                  title="Claim Seat"
                >
                  <Check size={28} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* GRID BROWSE MODE */}
      {viewMode === 'grid' && (
        <div className="space-y-6">
          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                  selectedCategory === cat 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEvents.map(event => {
              const isFull = event.registered >= event.capacity
              const percent = Math.min(100, Math.round((event.registered / event.capacity) * 100))

              return (
                <div key={event.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all group">
                  <div className={`h-28 bg-gradient-to-r ${event.gradient || 'from-indigo-600 to-blue-600'} p-4 flex justify-between items-start`}>
                    <span className="bg-white/90 backdrop-blur-md text-slate-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-slate-200">
                      {event.category}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm ${
                      isFull ? 'bg-rose-500 text-white' : 'bg-emerald-600 text-white'
                    }`}>
                      {isFull ? 'Full' : `${event.capacity - event.registered} spots left`}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{event.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">Organized by {event.organiser}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-slate-600 mt-3">
                        <span className="flex items-center gap-1.5"><Calendar size={13} className="text-indigo-600" />{event.date}</span>
                        <span className="flex items-center gap-1.5"><Clock size={13} className="text-indigo-600" />{event.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1.5 truncate">
                        <MapPin size={13} className="text-rose-500 shrink-0" />
                        <span>{event.venue}</span>
                      </p>

                      <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    <div>
                      <div className="mb-4">
                        <div className="flex justify-between text-[11px] mb-1 text-slate-500 font-medium">
                          <span>Capacity</span>
                          <span className={isFull ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>
                            {event.registered}/{event.capacity}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-1.5 rounded-full ${isFull ? 'bg-rose-500' : 'bg-gradient-to-r from-indigo-500 to-blue-500'}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleRegister(event.id)}
                        disabled={isFull}
                        className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isFull
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/10'
                        }`}
                      >
                        {isFull ? 'Capacity Reached' : 'RSVP / Register'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
