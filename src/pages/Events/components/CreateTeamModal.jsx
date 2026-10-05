import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Sparkles, Users, Tag, Loader2, ArrowRight, AlertCircle, Shield } from 'lucide-react'
import { createTeam } from '../../../services/api'
import { toast } from 'react-hot-toast'

export default function CreateTeamModal({ event, onClose, onTeamCreated }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [skills, setSkills] = useState(['React', 'FastAPI'])
  const [skillInput, setSkillInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const skillPresets = ['React', 'Python', 'FastAPI', 'UI/UX', 'PostgreSQL', 'AI/ML', 'Cloud', 'Mobile']

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = skillInput.trim().replace(/^,+|,+$/g, '')
      if (val && !skills.includes(val)) {
        setSkills(prev => [...prev, val])
        setSkillInput('')
      }
    }
  }

  const handleRemoveSkill = (skill) => {
    setSkills(prev => prev.filter(s => s !== skill))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please provide a squad name.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await createTeam(event.id, {
        name: name.trim(),
        description: description.trim(),
        preferred_skills: skills
      })

      if (res?.team) {
        toast.success(`Team "${res.team.name}" created! You are the Team Lead.`, { icon: '🚀' })
        onTeamCreated(res.team)
      } else {
        throw new Error('Failed to create team record')
      }
    } catch (err) {
      setError(err?.message || 'Failed to create team. Please try again.')
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
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-8"
      >
        {/* Header */}
        <div className="bg-indigo-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center transition-colors text-white"
          >
            <X size={16} />
          </button>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={12} />
            <span>Squad Formation</span>
          </div>

          <h3 className="text-2xl font-black">Create Your Team</h3>
          <p className="text-xs text-indigo-100 mt-1">
            For: <span className="font-semibold text-white">{event.title}</span>
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 font-mono">
              Team / Squad Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Quantum Hackers, Nebula Squad..."
              value={name}
              onChange={(e) => { setName(e.target.value); setError(null); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 font-mono">
              Project Pitch / Description
            </label>
            <textarea
              rows={3}
              placeholder="What are you building? What idea or problem are you tackling?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Desired Skills Chips */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 font-mono">
              Preferred / Needed Skills
            </label>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap gap-2 items-center min-h-[44px]">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg text-xs font-semibold"
                >
                  <Tag size={11} />
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-rose-600 transition-colors ml-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="Add skill (Enter)..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
                className="bg-transparent border-none text-xs text-slate-800 placeholder-slate-400 focus:outline-none flex-1 min-w-[120px] px-1 py-0.5"
              />
            </div>

            <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px] text-slate-500">
              <span className="font-medium">Presets:</span>
              {skillPresets.map(s => (
                <button
                  type="button"
                  key={s}
                  onClick={() => {
                    if (!skills.includes(s)) setSkills(prev => [...prev, s])
                  }}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
                >
                  +{s}
                </button>
              ))}
            </div>
          </div>

          {/* Team Lead Badge Notice */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-800">
            <Shield size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Team Lead Role:</span> You will be designated as the Team Lead, granting authority to generate invite codes and recruit campus participants.
            </div>
          </div>

          {/* Actions */}
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
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-500/20 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Generating Code...</span>
                </>
              ) : (
                <>
                  <span>Create Team & Code</span>
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
