'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type Preferences = Database['public']['Tables']['preferences']['Row']

interface Props {
  profile: Profile | null
  preferences: Preferences | null
}

export function SettingsView({ profile, preferences }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name ?? '',
    time_zone: profile?.time_zone ?? 'America/New_York',
    daily_study_threshold: String(profile?.daily_study_threshold ?? 6),
  })

  const [prefForm, setPrefForm] = useState({
    preferred_study_hours_start: preferences?.preferred_study_hours_start ?? '09:00',
    preferred_study_hours_end: preferences?.preferred_study_hours_end ?? '22:00',
    max_continuous_study_minutes: String(preferences?.max_continuous_study_minutes ?? 90),
    break_interval_minutes: String(preferences?.break_interval_minutes ?? 15),
    focus_mode_enabled: preferences?.focus_mode_enabled ?? true,
    pomodoro_enabled: preferences?.pomodoro_enabled ?? false,
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            ...profileForm,
            daily_study_threshold: parseInt(profileForm.daily_study_threshold),
          },
          preferences: {
            ...prefForm,
            max_continuous_study_minutes: parseInt(prefForm.max_continuous_study_minutes),
            break_interval_minutes: parseInt(prefForm.break_interval_minutes),
          },
        }),
      })
      if (!res.ok) throw new Error()
      toast.success('Settings saved!')
      router.refresh()
    } catch {
      toast.error('Could not save settings')
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full px-3 py-2 rounded-lg border border-[#e2e8f0] dark:border-[#334155] bg-transparent text-sm text-[#1e293b] dark:text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-indigo-500'

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1e293b] dark:text-[#f1f5f9]">Settings</h1>
        <p className="text-sm text-[#64748b] dark:text-[#94a3b8] mt-1">
          Customize how Homework Genius schedules your study time
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile section */}
        <section className="bg-white dark:bg-[#1e293b] border border-[#e2e8f0] dark:border-[#334155] rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold text-[#1e293b] dark:text-[#f1f5f9]">Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1">Full Name</label>
              <input
                className={inputClass}
                value={profileForm.full_name}
                onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1">Time Zone</label>
              <select
                className={inputClass}
                value={profileForm.time_zone}
                onChange={(e) => setProfileForm({ ...profileForm, time_zone: e.target.value })}
              >
                <option value="America/New_York">Eastern (ET)</option>
                <option value="America/Chicago">Central (CT)</option>
                <option value="America/Denver">Mountain (MT)</option>
                <option value="America/Los_Angeles">Pacific (PT)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1">
                Max daily study hours
              </label>
              <input
                type="number"
                min="1"
                max="16"
                className={inputClass}
                value={profileForm.daily_study_threshold}
                onChange={(e) => setProfileForm({ ...profileForm, daily_study_threshold: e.target.value })}
              />
            </div>
          </div>
        </section>

        {/* Scheduling preferences */}
        <section className="bg-white dark:bg-[#1e293b] border border-[#e2e8f0] dark:border-[#334155] rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold text-[#1e293b] dark:text-[#f1f5f9]">Scheduling Preferences</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1">Study window start</label>
              <input
                type="time"
                className={inputClass}
                value={prefForm.preferred_study_hours_start}
                onChange={(e) => setPrefForm({ ...prefForm, preferred_study_hours_start: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1">Study window end</label>
              <input
                type="time"
                className={inputClass}
                value={prefForm.preferred_study_hours_end}
                onChange={(e) => setPrefForm({ ...prefForm, preferred_study_hours_end: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1">
                Max continuous study (min)
              </label>
              <input
                type="number"
                min="25"
                max="240"
                step="5"
                className={inputClass}
                value={prefForm.max_continuous_study_minutes}
                onChange={(e) => setPrefForm({ ...prefForm, max_continuous_study_minutes: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1">Break duration (min)</label>
              <input
                type="number"
                min="5"
                max="60"
                step="5"
                className={inputClass}
                value={prefForm.break_interval_minutes}
                onChange={(e) => setPrefForm({ ...prefForm, break_interval_minutes: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-[#1e293b] dark:text-[#f1f5f9]">Focus Mode</p>
                <p className="text-xs text-[#94a3b8]">
                  Hides distractions when a study block starts
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPrefForm({ ...prefForm, focus_mode_enabled: !prefForm.focus_mode_enabled })}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  prefForm.focus_mode_enabled ? 'bg-indigo-600' : 'bg-[#e2e8f0] dark:bg-[#334155]'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    prefForm.focus_mode_enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-[#1e293b] dark:text-[#f1f5f9]">Pomodoro Mode</p>
                <p className="text-xs text-[#94a3b8]">
                  Enforces 25-min work / 5-min break cycles
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPrefForm({ ...prefForm, pomodoro_enabled: !prefForm.pomodoro_enabled })}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  prefForm.pomodoro_enabled ? 'bg-indigo-600' : 'bg-[#e2e8f0] dark:bg-[#334155]'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    prefForm.pomodoro_enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </label>
          </div>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-full transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}
