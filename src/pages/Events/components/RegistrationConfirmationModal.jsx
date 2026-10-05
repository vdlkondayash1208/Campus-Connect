import { motion } from 'framer-motion'
import { CheckCircle2, Ticket, Users, PlusCircle, ArrowRight, X, Calendar, MapPin, QrCode, Sparkles } from 'lucide-react'

export default function RegistrationConfirmationModal({ 
  event, 
  registrationData, 
  credentials, 
  onClose, 
  onCreateTeam, 
  onJoinTeam 
}) {
  const isTeamEvent = Boolean(event.is_team_event)
  const ticketId = registrationData?.ticket_id || `TKT-${String(event.id).slice(0, 4).toUpperCase()}-8492`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-8"
      >
        {/* Top Header */}
        <div className="bg-emerald-600 text-white p-6 pb-8 relative text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center transition-colors text-white"
          >
            <X size={16} />
          </button>
          
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <CheckCircle2 size={32} className="text-emerald-600" />
          </div>

          <h2 className="text-2xl font-black tracking-tight">Registration Confirmed!</h2>
          <p className="text-xs text-emerald-100 mt-1 max-w-sm mx-auto">
            Your seat is locked in PostgreSQL via ACID row-level locking.
          </p>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-6 -mt-3 bg-white rounded-t-2xl">
          {/* Ticket Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 relative overflow-hidden shadow-2xs">
            <div className="flex items-start justify-between gap-3 border-b border-dashed border-slate-300 pb-3 mb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                  EVENT TICKET PASS
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm">{event.title}</h3>
                <p className="text-[11px] text-slate-500">{event.venue || event.venue_name || 'Campus Venue'}</p>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs shrink-0 flex flex-col items-center">
                <QrCode size={36} className="text-slate-800" />
                <span className="text-[9px] font-mono text-slate-500 mt-0.5">{ticketId}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">ATTENDEE</span>
                <span className="font-semibold text-slate-800 truncate block">
                  {credentials?.['Full Name'] || credentials?.name || 'Registered Student'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">STATUS</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Seat Allocated
                </span>
              </div>
            </div>
          </div>

          {/* Conditional Branching */}
          {!isTeamEvent ? (
            /* INDIVIDUAL EVENT COMPLETION */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
                <Ticket className="text-indigo-600 shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Individual Event Participation</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    No team formation required. Bring your student ID and pass to check in on {event.date || 'the scheduled date'}.
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-500/20"
              >
                Done / Return to Events
              </button>
            </div>
          ) : (
            /* TEAM EVENT BRANCHING OPTIONS */
            <div className="space-y-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1 font-mono">
                  <Sparkles size={12} />
                  <span>Team Event Squad Formation</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">Choose your path to team up:</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Teams must have between {event.min_team_size || 2} and {event.max_team_size || 4} members.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Create Team */}
                <button
                  onClick={onCreateTeam}
                  className="p-4 rounded-2xl border-2 border-indigo-600 bg-indigo-50/40 hover:bg-indigo-50 text-left transition-all hover:scale-[1.02] active:scale-[0.98] group flex flex-col justify-between space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                    <PlusCircle size={20} />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                      Create a Team
                    </h5>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Lead a new squad, generate a shareable team code, and recruit campus builders.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                    Start Squad <ArrowRight size={13} />
                  </span>
                </button>

                {/* 2. Join Team */}
                <button
                  onClick={onJoinTeam}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-left transition-all hover:scale-[1.02] active:scale-[0.98] group flex flex-col justify-between space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                    <Users size={20} />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                      Join a Team
                    </h5>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Already have a team code from a friend? Enter it to join their squad.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    Enter Code <ArrowRight size={13} />
                  </span>
                </button>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-slate-500 hover:text-slate-800 underline decoration-slate-300 transition-colors"
                >
                  I'll form a team later
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
