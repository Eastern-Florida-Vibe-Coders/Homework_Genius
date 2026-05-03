import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { CookieOptions } from '@supabase/ssr'
import type { Database } from '@/types/database'
import type { TypedSupabaseClient } from '@/lib/supabase/types'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

function getDemoCredentials() {
  const isDev = process.env.NODE_ENV === 'development'
  const email =
    process.env.DEMO_USER_EMAIL ??
    (isDev ? 'demo@homeworkgenius.local' : undefined)
  const password =
    process.env.DEMO_USER_PASSWORD ??
    (isDev ? 'demo-homework-genius' : undefined)
  return { email, password }
}

function buildCookieSupabase(request: NextRequest, response: NextResponse) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  ) as unknown as TypedSupabaseClient
}

export async function POST(request: NextRequest) {
  const { email, password } = getDemoCredentials()
  if (!email || !password) {
    return NextResponse.json(
      { error: 'Demo login is not configured. Set DEMO_USER_EMAIL and DEMO_USER_PASSWORD in your environment.' },
      { status: 503 }
    )
  }

  let response = NextResponse.json({ ok: true })
  const supabase = buildCookieSupabase(request, response)

  const trySignIn = () => supabase.auth.signInWithPassword({ email, password })

  let { error } = await trySignIn()

  if (error) {
    const admin = createServiceRoleClient()
    if (admin) {
      const { error: createError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: 'Demo Student' },
      })
      const duplicate =
        createError?.message?.toLowerCase().includes('already') ||
        createError?.code === 'user_already_exists'
      if (createError && !duplicate) {
        return NextResponse.json({ error: createError.message }, { status: 500 })
      }
      const second = await trySignIn()
      error = second.error
    }
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }

  return response
}
