'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)

  const handleDemoLogin = async () => {
    setDemoLoading(true)
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        credentials: 'same-origin',
      })
      if (res.ok) {
        window.location.href = '/dashboard'
        return
      }
      const data = (await res.json()) as { error?: string }
      toast.error(data.error ?? 'Demo login failed')
    } finally {
      setDemoLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success('Check your email to confirm your account!')
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#0f172a] px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1e293b] dark:text-[#f1f5f9]">
            Create your account
          </h1>
          <p className="text-[#64748b] dark:text-[#94a3b8] mt-1 text-sm">
            Start building a schedule you can trust
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1e293b] dark:text-[#f1f5f9] mb-1.5">
              Full name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#1e293b] text-[#1e293b] dark:text-[#f1f5f9] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Jane Smith"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1e293b] dark:text-[#f1f5f9] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#1e293b] text-[#1e293b] dark:text-[#f1f5f9] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="you@university.edu"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1e293b] dark:text-[#f1f5f9] mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-2.5 rounded-xl border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#1e293b] text-[#1e293b] dark:text-[#f1f5f9] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Min. 8 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading || demoLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-full transition-all duration-200"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#e2e8f0] dark:border-[#334155]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wide">
            <span className="bg-[#f8fafc] dark:bg-[#0f172a] px-2 text-[#94a3b8]">or</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading || demoLoading}
          className="w-full border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#1e293b] text-[#334155] dark:text-[#e2e8f0] font-medium py-3 rounded-full transition-colors hover:bg-[#f1f5f9] dark:hover:bg-[#334155] disabled:opacity-60"
        >
          {demoLoading ? 'Signing in…' : 'Try Demo Account'}
        </button>
        <p className="text-center text-xs text-[#94a3b8] mt-2 max-w-sm mx-auto">
          Please use responsibly. Functions as one shared demo account for anyone using the account.
        </p>

        <p className="text-center text-sm text-[#64748b] dark:text-[#94a3b8] mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
