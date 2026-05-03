'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { BookOpen, Clock, Brain, ChevronRight } from 'lucide-react'

const steps = ['welcome', 'preferences', 'schedule'] as const
type Step = typeof steps[number]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('welcome')
  const [saving, setSaving] = useState(false)

  const [prefs, setPrefs] = useState({
    preferred_study_hours_start: '09:00',
    preferred_study_hours_end: '22:00',
    max_continuous_study_minutes: '90',
    break_interval_minutes: '15',
    pomodoro_enabled: false,
  })

  const handleFinish = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user')

      await supabase.from('preferences').upsert({
        user_id: user.id,
        ...prefs,
        max_continuous_study_minutes: parseInt(prefs.max_continuous_study_minutes),
        break_interval_minutes: parseInt(prefs.break_interval_minutes),
      })

      await supabase.from('profiles').update({ onboarding_complete: true }).eq('id', user.id)

      toast.success("You're all set! Let's build your first schedule.")
      router.push('/dashboard')
      router.refresh()
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full px-3 py-2 rounded-lg border border-[#e2e8f0] dark:border-[#334155] bg-transparent text-sm text-[#1e293b] dark:text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-indigo-500'

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#0f172a] px-6 py-12">
      <div className="w-full max-w-lg">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full transition-colors ${
                s === step ? 'bg-indigo-600' : steps.indexOf(step) > i ? 'bg-emerald-500' : 'bg-[#e2e8f0]'
              }`} />
              {i < steps.length - 1 && <div className="w-8 h-px bg-[#e2e8f0] dark:bg-[#334155]" />}
            </div>
          ))}
        </div>

        {step === 'welcome' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-950 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-[#1e293b] dark:text-[#f1f5f9] mb-3">
              Welcome to Homework Genius
            </h1>
            <p className="text-[#64748b] dark:text-[#94a3b8] mb-8 leading-relaxed">
              We&apos;re going to build a schedule that you can actually trust. No more guilt about
              relaxing — when it&apos;s study time, you&apos;ll know it. When it&apos;s free time, enjoy it fully.
            </p>
            <div className="grid grid-cols-3 gap-4 mb-10">
              {[
                { icon: Clock, label: 'Smart Scheduling' },
                { icon: Brain, label: 'Deep Focus' },
                { icon: BookOpen, label: 'No FOMO' },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="bg-white dark:bg-[#1e293b] border border-[#e2e8f0] dark:border-[#334155] rounded-xl p-4 flex flex-col items-center gap-2"
                >
                  <Icon className="w-6 h-6 text-indigo-600" />
                  <span className="text-xs font-medium text-[#64748b]">{label}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep('preferences')}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-full transition-colors"
            >
              Get started <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 'preferences' && (
          <div>
            <h2 className="text-2xl font-bold text-[#1e293b] dark:text-[#f1f5f9] mb-2">
              When do you study best?
            </h2>
            <p className="text-[#64748b] dark:text-[#94a3b8] mb-6">
              We&apos;ll only schedule study blocks within your preferred window.
            </p>
            <div className="space-y-4 bg-white dark:bg-[#1e293b] border border-[#e2e8f0] dark:border-[#334155] rounded-2xl p-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#64748b] mb-1">Earliest study time</label>
                  <input
                    type="time"
                    className={inputClass}
                    value={prefs.preferred_study_hours_start}
                    onChange={(e) => setPrefs({ ...prefs, preferred_study_hours_start: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#64748b] mb-1">Latest study time</label>
                  <input
                    type="time"
                    className={inputClass}
                    value={prefs.preferred_study_hours_end}
                    onChange={(e) => setPrefs({ ...prefs, preferred_study_hours_end: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#64748b] mb-1">
                    Max focus session (min)
                  </label>
                  <select
                    className={inputClass}
                    value={prefs.max_continuous_study_minutes}
                    onChange={(e) => setPrefs({ ...prefs, max_continuous_study_minutes: e.target.value })}
                  >
                    <option value="25">25 min (Pomodoro)</option>
                    <option value="45">45 min</option>
                    <option value="60">60 min</option>
                    <option value="90">90 min (Deep Work)</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#64748b] mb-1">Break length (min)</label>
                  <select
                    className={inputClass}
                    value={prefs.break_interval_minutes}
                    onChange={(e) => setPrefs({ ...prefs, break_interval_minutes: e.target.value })}
                  >
                    <option value="5">5 min</option>
                    <option value="10">10 min</option>
                    <option value="15">15 min</option>
                    <option value="20">20 min</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep('welcome')}
                className="text-sm text-[#64748b] border border-[#e2e8f0] dark:border-[#334155] px-5 py-2.5 rounded-full hover:border-[#94a3b8] transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep('schedule')}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-full transition-colors"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 'schedule' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#1e293b] dark:text-[#f1f5f9] mb-3">
              You&apos;re ready to go!
            </h2>
            <p className="text-[#64748b] dark:text-[#94a3b8] mb-4 leading-relaxed">
              Head to the dashboard to add your tasks and commitments, then hit{' '}
              <strong>Generate Schedule</strong> to let Homework Genius do its thing.
            </p>
            <div className="bg-indigo-50 dark:bg-indigo-950 rounded-xl p-4 text-sm text-indigo-700 dark:text-indigo-300 text-left mb-8">
              <p className="font-semibold mb-1">💡 Pro tip</p>
              <p>
                Add your weekly class schedule and work shifts first — those are your fixed blocks.
                Then add assignments with estimated hours and deadlines. We&apos;ll handle the rest.
              </p>
            </div>
            <button
              onClick={handleFinish}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-full transition-colors disabled:opacity-50"
            >
              {saving ? 'Setting up...' : 'Go to Dashboard'} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
