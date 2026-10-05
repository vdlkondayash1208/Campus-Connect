import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, MapPin, Users, Sparkles, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react'
import { registerForEvent } from '../../../services/api'
import { toast } from 'react-hot-toast'

export default function EventRegistrationModal({ event, profile, onClose, onSuccess }) {
  const [credentials, setCredentials] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const requiredFields = (Array.isArray(event.required_registration_fields) && event.required_registration_fields.length > 0)
    ? event.required_registration_fields
    : ['Full Name', 'Roll Number', 'Department', 'GitHub URL']

  useEffect(() => {
    // Pre-populate fields from current user's profile
    const initial = {}
    requiredFields.forEach(field => {
      const lower = field.toLowerCase()
      if (lower.includes('name')) {
        initial[field] = profile?.full_name || ''
      } else if (lower.includes('email')) {
        initial[field] = profile?.email || ''
      } else if (lower.includes('roll') || lower.includes('id')) {
        initial[field] = '2023CSE' + Math.floor(1000 + Math.random() * 9000)
      } else if (lower.includes('dept') || lower.includes('branch')) {
        initial[field] = 'Computer Science & Engineering'
      } else if (lower.includes('year')) {
        initial[field] = '3rd Year'
      } else if (lower.includes('github')) {
        initial[field] = 'https://github.com/' + (profile?.email?.split('@')[0] || 'student')
      } else if (lower.includes('skill')) {
        initial[field] = Array.isArray(profile?.skills) ? profile.skills.join(', ') : 'React, Python, Tailwind'
      } else {
        initial[field] = ''
      }
    })
    setCredentials(initial)
  }, [event, profile])

  const handleInputChange = (field, val) => {
    setCredentials(prev => ({ ...prev, [field]: val }))
    if (error) setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validate all required fields
    for (const field of requiredFields) {
      if (!credentials[field] || !String(credentials[field]).trim()) {
        setError(`Please provide your "${field}" to complete registration.`)
        return
      }
    }

    setLoading(true)
    try {
      const result = await registerForEvent(event.id, credentials)
      toast.success('Spot secured! Registration verified by database ACID lock.', { icon: '🎟️' })
      onSuccess(result, credentials)
    } catch (err) {
      setError(err?.message || 'Registration failed. Please check capacity.')
    } finally {
      setLoading(false)
    }
  }

  const isFull = event.registered >= event.capacity

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/50 backdrop-blur-xs overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-8"
      >
        {/* Header Graphic Banner */}
        <div className={`h-28 bg-gradient-to-r ${event.gradient || 'from-indigo-600 via-indigo-700 to-blue-600'} p-6 flex justify-between items-start text-white relative`}>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider mb-1">
              <Sparkles size={11} />
              <span>Event Registration</span>
            </div>
            <h2 className="text-xl font-extrabold truncate max-w-sm drop-shadow-xs">{event.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center transition-colors text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Event Quick Info Badges */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar size={13} className="text-indigo-600" />
              {event.date || event.start_at?.slice(0, 10) || 'Upcoming'}
            </span>
            <span className="flex items-center gap-1.5 truncate max-w-[180px]">
              <MapPin size={13} className="text-rose-500 shrink-0" />
              {event.venue || event.venue_name || 'Campus Venue'}
            </span>
          </div>

          <div>
            {event.is_team_event ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-[11px]">
                <Users size={11} />
                Team Event ({event.min_team_size || 2}-{event.max_team_size || 4} members)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-[11px]">
                Solo Event (1 Spot)
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Required Participant Credentials</h3>
            <p className="text-xs text-slate-500">
              This event organizers require the following verified credentials to issue your registration pass.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3 max-h-[42vh] overflow-y-auto pr-1">
            {requiredFields.map((field) => {
              const lower = field.toLowerCase()
              const isUrl = lower.includes('url') || lower.includes('link') || lower.includes('github') || lower.includes('portfolio')
              return (
                <div key={field}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {field} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type={isUrl ? 'url' : 'text'}
                    required
                    placeholder={`Enter your ${field.toLowerCase()}...`}
                    value={credentials[field] || ''}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-medium"
                  />
                </div>
              )
            })}
          </div>

          {/* Capacity Meter */}
          <div className="pt-2">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Current Seat Capacity</span>
              <span className="font-semibold text-slate-700">{event.registered}/{event.capacity} seats reserved</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-1.5 rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.round((event.registered / (event.capacity || 100)) * 100))}%` }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isFull}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                isFull
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Securing Seat...</span>
                </>
              ) : (
                <>
                  <span>Confirm Registration</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
