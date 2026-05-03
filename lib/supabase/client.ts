import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'
import type { TypedSupabaseClient } from '@/lib/supabase/types'

export function createClient(): TypedSupabaseClient {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ) as unknown as TypedSupabaseClient
}
