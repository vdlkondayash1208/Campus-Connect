import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  X, Loader2, Calendar as CalendarIcon, Clock, MapPin, 
  Users, Tag, AlertCircle, Building2, Globe, ShieldAlert, Sparkles, Plus 
} from 'lucide-react'

export default function EventModal({ event, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    club: '',
    tags: ['Hackathon', 'AI'],
    venue_name: '',
    latitude: 17.385044,
    longitude: 78.486671,
    capacity: 100,
    max_team_size: 4,
    start_at: '',
    deadline_at: '',
    expire_at: '',
  })
  
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [validationError, setValidationError] = useState(null)

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        club: event.club || event.category || 'Computer Science Club',
        tags: Array.isArray(event.tags) ? event.tags : (event.required_skills || ['Hackathon']),
        venue_name: event.venue_name || event.venue || '',
        latitude: event.latitude || 17.385044,
        longitude: event.longitude || 78.486671,
        capacity: event.capacity || 100,
        max_team_size: event.max_team_size || 4,
        start_at: event.start_at ? event.start_at.slice(0, 16) : '2026-10-15T10:00',
        deadline_at: event.deadline_at ? event.deadline_at.slice(0, 16) : '2026-10-14T23:59',
        expire_at: event.expire_at ? event.expire_at.slice(0, 16) : '2026-10-16T23:59',
      })
    } else {
      // Default dates satisfying deadline_at <= start_at < expire_at
      const now = new Date()
      const dline = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      const start = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000)
      const expire = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000)

      setFormData(prev => ({
        ...prev,
        deadline_at: dline.toISOString().slice(0, 16),
        start_at: start.toISOString().slice(0, 16),
        expire_at: expire.toISOString().slice(0, 16),
      }))
    }
  }, [event])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (validationError) setValidationError(null)
  }

  // Tags chip input management
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const trimmed = tagInput.trim().replace(/^,+|,+$/g, '')
      if (trimmed && !formData.tags.includes(trimmed)) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, trimmed] }))
        setTagInput('')
      }
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }))
  }

  const popularTags = ['Hackathon', 'Web3', 'AI', 'Cloud', 'UI/UX', 'Robotics', 'FinTech', 'Data Science']

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError(null)

    const capacityNum = parseInt(formData.capacity, 10)
    const maxTeamSizeNum = parseInt(formData.max_team_size, 10)

    // 1. Capacity & Team Size constraints
    if (isNaN(capacityNum) || capacityNum < 0) {
      setValidationError('Database Constraint Failure: Max Capacity must be an integer >= 0.')
      return
    }

    if (isNaN(maxTeamSizeNum) || maxTeamSizeNum < 1) {
      setValidationError('Database Constraint Failure: Max Team Size must be an integer >= 1.')
      return
    }

    // 2. Date Constraints: deadline_at <= start_at and start_at < expire_at
    const deadlineDate = new Date(formData.deadline_at)
    const startDate = new Date(formData.start_at)
    const expireDate = new Date(formData.expire_at)

    if (isNaN(deadlineDate.getTime()) || isNaN(startDate.getTime()) || isNaN(expireDate.getTime())) {
      setValidationError('All timestamp fields (Start, Deadline, and Expiration) are strictly required.')
      return
    }

    if (deadlineDate > startDate) {
      setValidationError('Database Validation: Registration Deadline (deadline_at) must precede or equal Start Time (start_at).')
      return
    }

    if (startDate >= expireDate) {
      setValidationError('Database Validation: Event Start Time (start_at) must precede the pg_cron Archival Expiration (expire_at).')
      return
    }

    setLoading(true)

    const processedData = {
      ...formData,
      capacity: capacityNum,
      max_team_size: maxTeamSizeNum,
      latitude: parseFloat(formData.latitude) || 17.385044,
      longitude: parseFloat(formData.longitude) || 78.486671,
      start_at: new Date(formData.start_at).toISOString(),
      deadline_at: new Date(formData.deadline_at).toISOString(),
      expire_at: new Date(formData.expire_at).toISOString(),
    }

    try {
      await onSave(processedData)
    } catch (err) {
      setValidationError(err?.message || 'Error writing event transaction to database.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="relative bg-white border border-slate-200 rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col z-10 my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-white sticky top-0 z-20">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {event ? 'Edit Campus Event' : 'Create Campus Event'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enforced by PostgreSQL constraints with PostGIS coordinates and pg_cron archival.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors p-2 rounded-xl hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* 1. Title & Organizing Club */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                Event Title (`title`) *
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="Campus Hackathon 2026"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                Organizing Club (`club`) *
              </label>
              <input
                type="text"
                name="club"
                required
                placeholder="Computer Science Club"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                value={formData.club}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* 2. Tags Array (`tags` text[] with chip input) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
              Tags Array (`tags` text[]) — Type & Press Enter / Comma
            </label>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap gap-2 items-center min-h-[44px]">
              {formData.tags.map((tag) => (
                <span 
                  key={tag}
                  className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg text-xs font-semibold"
                >
                  <Tag size={11} />
                  <span>{tag}</span>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-600 transition-colors ml-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="Add tag (e.g. Web3, AI)..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="bg-transparent border-none text-xs text-slate-800 placeholder-slate-400 focus:outline-none flex-1 min-w-[140px] px-1 py-0.5"
              />
            </div>

            {/* Quick tag suggestions */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px] text-slate-500">
              <span className="font-medium">Suggestions:</span>
              {popularTags.map(tag => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => {
                    if (!formData.tags.includes(tag)) {
                      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }))
                    }
                  }}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
                >
                  +{tag}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Venue Name & Venue Coordinates (PostGIS Point) */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                Venue Name (`venue_name`) *
              </label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="venue_name"
                  required
                  placeholder="Main Library, Innovation Floor"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                  value={formData.venue_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 font-mono">
                  Latitude (`latitude` PostGIS)
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={formData.latitude}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 font-mono">
                  Longitude (`longitude` PostGIS)
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={formData.longitude}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* 4. Capacity (CHECK >= 0) & Max Team Size (CHECK >= 1) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                Max Capacity (`capacity` &gt;= 0) *
              </label>
              <input
                type="number"
                min="0"
                name="capacity"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                value={formData.capacity}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                Max Team Size (`max_team_size` &gt;= 1) *
              </label>
              <input
                type="number"
                min="1"
                max="10"
                name="max_team_size"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                value={formData.max_team_size}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* 5. Timestamps: start_at, deadline_at, expire_at with constraint validations */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold uppercase tracking-wider text-slate-700">
                Timestamp Boundaries
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                deadline_at ≤ start_at &lt; expire_at
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 font-mono">
                  Deadline (`deadline_at`) *
                </label>
                <input
                  type="datetime-local"
                  name="deadline_at"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                  value={formData.deadline_at}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 font-mono">
                  Start Date (`start_at`) *
                </label>
                <input
                  type="datetime-local"
                  name="start_at"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                  value={formData.start_at}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 font-mono">
                  Archive (`expire_at`) *
                </label>
                <input
                  type="datetime-local"
                  name="expire_at"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                  value={formData.expire_at}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-70"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              <span>{event ? 'Update Event Record' : 'Publish Campus Event'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
