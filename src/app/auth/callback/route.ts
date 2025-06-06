import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Debug logs for callback
  console.log('--- /auth/callback ---')
  console.log('request.url:', request.url)
  const { searchParams, origin } = new URL(request.url)
  console.log('origin:', origin)
  const forwardedHost = request.headers.get('x-forwarded-host')
  console.log('x-forwarded-host:', forwardedHost)
  console.log('NODE_ENV:', process.env.NODE_ENV)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}