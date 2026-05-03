'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Settings,
  LogOut,
  BookOpen,
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function DashboardNav({ user }: { user: User }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#e2e8f0] dark:border-[#334155] bg-white/80 dark:bg-[#1e293b]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-indigo-600">
          <BookOpen className="w-5 h-5" />
          <span className="text-[#1e293b] dark:text-[#f1f5f9]">Homework Genius</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600'
                  : 'text-[#64748b] hover:text-[#1e293b] dark:hover:text-[#f1f5f9] hover:bg-[#f1f5f9] dark:hover:bg-[#334155]'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* User + sign out */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-[#64748b] dark:text-[#94a3b8]">
            {user.email}
          </span>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-sm text-[#64748b] dark:text-[#94a3b8] hover:text-[#ef4444] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden flex border-t border-[#e2e8f0] dark:border-[#334155]">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors',
              pathname === href
                ? 'text-indigo-600'
                : 'text-[#94a3b8]'
            )}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            {label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
