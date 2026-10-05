import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Users, KeyRound, Loader2, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import { joinTeam } from '../../../services/api'
import { toast } from 'react-hot-toast'

export default function JoinTeamModal({ event, onClose, onTeamJoined }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const cleanCode = code.trim().toUpperCase()
    if (!cleanCode) {
      setError('Please enter a team invite code.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await joinTeam(cleanCode)
      if (res?.team) {
        toast.success(res.message || 'Successfully joined squad!', { icon: '🤝' })
        onTeamJoined(res.team)
      } else {
        throw new Error('Team not found or code expired')
      }
    } catch (err) {
      setError(err?.message || 'Could not join team. Please check the code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-8"
      >
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X size={16} />
          </button>
          
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center mb-3">
            <KeyRound size={20} className="text-white" />
          </div>

          <h3 className="text-xl font-black">Join a Squad</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Enter the 6-character team invite code shared by your Team Lead.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
              Team Invite Code
            </label>
            <input
              type="text"
              required
              maxLength={12}
              placeholder="e.g. CAMP-9X42"
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(null); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center text-lg font-mono font-bold tracking-widest text-indigo-700 uppercase placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <p className="text-[11px] text-slate-500 text-center">
            Once you join, you will be added to the team roster and can participate collaboratively in {event?.title}.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Validating Code...</span>
                </>
              ) : (
                <>
                  <span>Join Squad</span>
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
