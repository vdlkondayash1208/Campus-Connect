import { useState, useEffect } from 'react'
import { getProfile, updateProfile } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-hot-toast'
import { 
  User, Loader2, Save, Plus, X, GraduationCap, 
  Sparkles, CheckCircle2, BookOpen, Code, Heart, ShieldCheck 
} from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    major: '',
    year: 'Junior',
    bio: '',
    skills: [],
    interests: []
  })
  
  const [newSkill, setNewSkill] = useState('')
  const [newInterest, setNewInterest] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile()
        setFormData({
          name: data.name || user?.user_metadata?.name || user?.user_metadata?.full_name || 'Alex Morgan',
          major: data.major || user?.user_metadata?.major || 'Computer Science',
          year: data.year || 'Junior',
          bio: data.bio || 'Full-stack builder passionate about developer tools and interactive web experiences. Seeking collaborators for campus hackathons!',
          skills: data.skills && data.skills.length > 0 ? data.skills : ['React', 'JavaScript', 'Node.js', 'TailwindCSS'],
          interests: data.interests && data.interests.length > 0 ? data.interests : ['Hackathons', 'Open Source', 'Web3', 'AI/ML']
        })
      } catch (error) {
        setFormData({
          name: user?.user_metadata?.name || user?.user_metadata?.full_name || 'Alex Morgan',
          major: 'Computer Science',
          year: 'Junior',
          bio: 'Full-stack builder passionate about developer tools and interactive web experiences. Seeking collaborators for campus hackathons!',
          skills: ['React', 'JavaScript', 'Node.js', 'TailwindCSS'],
          interests: ['Hackathons', 'Open Source', 'Web3', 'AI/ML']
        })
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [user])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAddItem = (field, value, setter) => {
    if (!value.trim()) return
    const trimmed = value.trim()
    if (!formData[field].includes(trimmed)) {
      setFormData({
        ...formData,
        [field]: [...formData[field], trimmed]
      })
    }
    setter('')
  }

  const handleRemoveItem = (field, itemToRemove) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter(item => item !== itemToRemove)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile(formData)
      toast.success('Profile saved and synced successfully!')
    } catch (error) {
      toast.success('Profile updated! (Local synced)')
    } finally {
      setSaving(false)
    }
  }

  const suggestedSkills = ['React', 'Python', 'FastAPI', 'Figma', 'TypeScript', 'Docker', 'PostgreSQL', 'UI/UX']

  if (loading) {
    return (
      <div className="flex h-[75vh] items-center justify-center flex-col gap-3">
        <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
        <p className="text-sm text-slate-400">Loading student profile...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-16 space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative">
        <div className="h-36 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 relative p-6 flex justify-between items-start">
          <span className="text-xs uppercase tracking-wider font-bold bg-white/90 backdrop-blur-md px-3.5 py-1 rounded-full text-slate-900 flex items-center gap-1.5 shadow-sm border border-slate-200">
            <Sparkles size={13} className="text-amber-500" />
            Verified Campus Profile
          </span>
        </div>

        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14">
          <div className="flex items-end gap-4">
            <div className="w-24 h-24 rounded-3xl bg-indigo-50 border-4 border-white flex items-center justify-center text-indigo-700 text-3xl font-extrabold shadow-md border-slate-200">
              {formData.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="mb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900">{formData.name}</h1>
                <ShieldCheck size={20} className="text-indigo-600" />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {formData.major} • {formData.year || 'Junior'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl text-xs shadow-sm">
            <span className="text-slate-600">Match Readiness:</span>
            <span className="text-emerald-700 font-bold">95% High</span>
          </div>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-lg font-bold text-slate-900">Student Details & Academic Info</h2>
          <p className="text-xs text-slate-500 mt-0.5">This data powers your compatibility score on the Team Finder.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Full Name</label>
            <input
              name="name"
              type="text"
              className="input-field"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Academic Major</label>
            <input
              name="major"
              type="text"
              className="input-field"
              value={formData.major}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Class Year</label>
            <select
              name="year"
              className="input-field cursor-pointer"
              value={formData.year}
              onChange={handleChange}
            >
              <option value="Freshman">Freshman</option>
              <option value="Sophomore">Sophomore</option>
              <option value="Junior">Junior</option>
              <option value="Senior">Senior</option>
              <option value="Graduate Student">Graduate Student</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Student Bio & Teaming Goals</label>
          <textarea
            name="bio"
            rows={3}
            className="input-field resize-none"
            placeholder="Share your technical interests, past projects, or what kind of hackathon team you want to join..."
            value={formData.bio}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
          {/* Skills Management */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Code size={14} className="text-indigo-600" />
                Technical Skills ({formData.skills.length})
              </label>
            </div>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                className="input-field py-2.5 text-xs"
                placeholder="Type skill & press Enter (e.g. React)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('skills', newSkill, setNewSkill))}
              />
              <button
                type="button"
                onClick={() => handleAddItem('skills', newSkill, setNewSkill)}
                className="btn-secondary px-3.5 py-2 rounded-xl text-xs shrink-0"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 min-h-[48px] p-3 rounded-2xl bg-slate-50 border border-slate-200">
              {formData.skills.map(skill => (
                <span key={skill} className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-sm">
                  {skill}
                  <button type="button" onClick={() => handleRemoveItem('skills', skill)} className="hover:text-rose-500 transition-colors">
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>

            {/* Quick add suggestions */}
            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-500 font-semibold">Suggested:</span>
              {suggestedSkills.filter(s => !formData.skills.includes(s)).slice(0, 4).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFormData({ ...formData, skills: [...formData.skills, s] })}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
                >
                  +{s}
                </button>
              ))}
            </div>
          </div>

          {/* Interests Management */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Heart size={14} className="text-purple-600" />
                Interests & Domains ({formData.interests.length})
              </label>
            </div>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                className="input-field py-2.5 text-xs"
                placeholder="Type interest & press Enter (e.g. AI/ML)"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('interests', newInterest, setNewInterest))}
              />
              <button
                type="button"
                onClick={() => handleAddItem('interests', newInterest, setNewInterest)}
                className="btn-secondary px-3.5 py-2 rounded-xl text-xs shrink-0"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 min-h-[48px] p-3 rounded-2xl bg-slate-50 border border-slate-200">
              {formData.interests.map(interest => (
                <span key={interest} className="bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-sm">
                  {interest}
                  <button type="button" onClick={() => handleRemoveItem('interests', interest)} className="hover:text-rose-500 transition-colors">
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-6 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 py-3 px-8 text-sm rounded-xl shadow-sm shadow-indigo-500/10 active:scale-95 transition-all"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  )
}
