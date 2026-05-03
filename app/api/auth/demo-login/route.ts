import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const email = process.env.DEMO_USER_EMAIL
  const password = process.env.DEMO_USER_PASSWORD

  if (!email || !password) {
    return NextResponse.json(
      {
        error:
          'Demo login is not configured. Set DEMO_USER_EMAIL and DEMO_USER_PASSWORD in .env.local (and on Vercel when deployed).',
      },
      { status: 503 }
    )
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }

  return NextResponse.json({ success: true })
}
