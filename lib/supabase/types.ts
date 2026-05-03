import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * `@supabase/ssr` types `createServerClient` / `createBrowserClient` as
 * `SupabaseClient<Database, SchemaName, Schema>` (3 args), but `SupabaseClient`
 * has separate slots for schema *name* vs schema *shape*. That mismatch makes
 * `.from()` infer as `never`. We assert the correct parameterization at our
 * factory boundaries.
 */
export type TypedSupabaseClient = SupabaseClient<
  Database,
  'public',
  'public',
  Database['public']
>
