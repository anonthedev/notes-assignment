import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { toast } from 'sonner'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      toast.error('Authentication failed', {
        description: error.message
      })
      return NextResponse.redirect(new URL('/login', request.url))
    }

    toast.success('Successfully authenticated')
    return NextResponse.redirect(new URL('/', request.url))
  }

  toast.error('Invalid authentication attempt')
  return NextResponse.redirect(new URL('/login', request.url))
} 