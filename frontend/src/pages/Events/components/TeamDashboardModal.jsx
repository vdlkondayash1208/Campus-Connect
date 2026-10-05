import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  X, Copy, Check, Users, UserPlus, Share2, Sparkles, 
  Shield, Mail, ArrowUpRight, CheckCircle2, Clock 
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import RequestMembersModal from './RequestMembersModal'

export default function TeamDashboardModal({ event, team, onClose, onUpdateTeam }) {
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)

  const teamCode = team.team_code || 'CAMP-CODE'
  const maxTeamSize = team.max_team_size || event?.max_team_size || 4
  const members = team.members || []
  const invitations = team.invitations || []

  const handleCopyCode = () => {
    navigator.clipboard.writeText(teamCode)
    setCopiedCode(true)
    toast.success('Team code copied to clipboard!')
    setTimeout(() => setCopiedCode(false), 2500)
  }

  const handleCopyLink = () => {
    const inviteUrl = `${window.location.origin}/events?join_team=${teamCode}`
    navigator.clipboard.writeText(inviteUrl)
    setCopiedLink(true)
    toast.success('Squad invite link copied to clipboard!')
    setTimeout(() => setCopiedLink(false), 2500)
  }

  const handleInviteSent = (student) => {
    const newInvitation = {
      id: `inv_${Date.now()}`,
      receiver_id: student.id,
      receiver_name: student.name,
      status: 'pending',
      created_at: new Date().toISOString()
    }
    const updated = {
      ...team,
      invitations: [...invitations, newInvitation]
    }
    if (onUpdateTeam) onUpdateTeam(updated)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-8 flex flex-col max-h-[88vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center transition-colors text-white"
          >
            <X size={16} />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={12} />
            <span>Squad Headquarters</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-white">{team.name}</h2>
              <p className="text-xs text-indigo-100 mt-0.5">
                Registered for: <span className="font-semibold text-white">{event.title}</span>
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-2xl shrink-0 flex items-center gap-2">
              <Users size={16} className="text-indigo-200" />
              <span className="text-xs font-bold font-mono">
                {members.length} / {maxTeamSize} Members
              </span>
            </div>
          </div>
        </div>

        {/* Action Bar: Invite Friends & Request Members */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Invite Friends via Team Code */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                  INVITE SQUADMATES
                </span>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                  1-Click Share
                </span>
              </div>

              <div className="bg-slate-50 border border-indigo-100 rounded-xl p-2.5 flex items-center justify-between gap-2">
                <span className="text-lg font-mono font-black text-indigo-700 tracking-wider pl-1">
                  {teamCode}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopyCode}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                      copiedCode
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs'
                    }`}
                    title="Copy Code"
                  >
                    {copiedCode ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className={`p-1.5 rounded-lg text-xs font-bold flex items-center transition-all ${
                      copiedLink
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                    title="Copy Invite Link"
                  >
                    {copiedLink ? <Check size={14} /> : <Share2 size={14} />}
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Share this unique alphanumeric code with fellow students to instantly join your squad.
              </p>
            </div>

            {/* 2. Request Members via Directory */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-1">
                  RECRUIT PARTICIPANTS
                </span>
                <h4 className="text-xs font-bold text-slate-800">Campus Student Directory</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Search registered participants by skill stack and send direct invitations.
                </p>
              </div>

              <button
                onClick={() => setIsRequestModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
              >
                <UserPlus size={14} />
                <span>Request Members</span>
              </button>
            </div>
          </div>
        </div>

        {/* Team Roster & Invitations */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Members Roster */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                Squad Members ({members.length})
              </h3>
              <span className="text-[11px] text-slate-500">
                Capacity: {maxTeamSize - members.length} spots remaining
              </span>
            </div>

            <div className="space-y-2.5">
              {members.map((member, idx) => (
                <div
                  key={member.student_id || idx}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                      {member.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{member.full_name}</span>
                        {member.role === 'leader' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            <Shield size={10} />
                            Lead
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            Member
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">{member.email || 'university.edu student'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {member.skills?.slice(0, 3).map(s => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Invitations */}
          {invitations.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-2">
                Pending Invitations ({invitations.length})
              </h3>
              <div className="space-y-2">
                {invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Clock size={13} className="text-amber-500" />
                      <span className="font-semibold text-slate-800">{inv.receiver_name}</span>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100/80 text-amber-700 font-bold">
                      Awaiting Response
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-500/10"
          >
            Done / Close Dashboard
          </button>
        </div>

        {/* Nested Directory Recruitment Modal */}
        {isRequestModalOpen && (
          <RequestMembersModal
            event={event}
            team={team}
            onClose={() => setIsRequestModalOpen(false)}
            onInviteSent={handleInviteSent}
          />
        )}
      </motion.div>
    </div>
  )
}
