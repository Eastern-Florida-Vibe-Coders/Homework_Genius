import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Server-only client for Auth Admin API. No browser session / cookies.
 * Used to create a pre-confirmed demo user without email verification.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
