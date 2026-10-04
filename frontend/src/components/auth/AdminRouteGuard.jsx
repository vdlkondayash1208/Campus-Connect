import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useEffect, useState } from 'react'
import { checkIsAdmin } from '../../services/adminApi'

// Module-level authorization cache so route changes don't re-trigger async loading
let isAuthorizedSession = null

export const AdminRouteGuard = () => {
  const { user, loading } = useAuth()

  // Initialize synchronously on Frame 0
  const [isAdmin, setIsAdmin] = useState(() => {
    if (isAuthorizedSession === true) return true
    
    // Check localStorage session synchronously
    try {
      const local = localStorage.getItem('faculty_admin_session')
      if (local) {
        const parsed = JSON.parse(local)
        if (parsed?.user_metadata?.role === 'admin' || parsed?.email?.includes('admin')) {
          isAuthorizedSession = true
          return true
        }
      }
    } catch (e) {}

    // Check user context synchronously
    if (user?.email === 'faculty.admin@university.edu' || user?.email === 'admin@demo.com' || user?.user_metadata?.role === 'admin') {
      isAuthorizedSession = true
      return true
    }

    return null
  })

  useEffect(() => {
    // If already verified synchronously, do nothing
    if (isAdmin === true) return

    let isMounted = true

    const verify = async () => {
      const local = localStorage.getItem('faculty_admin_session')
      if (local) {
        try {
          const parsed = JSON.parse(local)
          if (parsed?.user_metadata?.role === 'admin' || parsed?.email?.includes('admin')) {
            isAuthorizedSession = true
            if (isMounted) setIsAdmin(true)
            return
          }
        } catch (e) {}
      }

      if (user) {
        const authorized = await checkIsAdmin(user)
        if (isMounted) {
          isAuthorizedSession = authorized
          setIsAdmin(authorized)
        }
      } else if (!loading) {
        if (isMounted) {
          isAuthorizedSession = false
          setIsAdmin(false)
        }
      }
    }

    verify()

    return () => {
      isMounted = false
    }
  }, [user, loading, isAdmin])

  // If already authorized, render immediately (0ms perceptible latency)
  if (isAdmin === true || isAuthorizedSession === true) {
    return <Outlet />
  }

  // Only show quick loader on initial unauthenticated boot
  if (isAdmin === null && loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 [background-image:radial-gradient(rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:24px_24px]">
        <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-slate-700 font-mono tracking-wider">
            Verifying Faculty Authorization...
          </span>
        </div>
      </div>
    )
  }

  if (isAdmin === false) {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}

export default AdminRouteGuard
