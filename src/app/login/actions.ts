'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type AuthError = {
  type: 'INVALID_CREDENTIALS' | 'EMAIL_NOT_VERIFIED' | 'GOOGLE_ERROR' | 'OTHER'
  message: string
  email?: string
}

export async function login(formData: FormData): Promise<AuthError | undefined> {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  console.log(data)
  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return {
        type: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      }
    }

    if (error.message.includes('Email not confirmed')) {
      return {
        type: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email to continue',
        email: data.email
      }
    }

    return {
      type: 'OTHER',
      message: error.message
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function loginWithGoogle(): Promise<AuthError | undefined> {
  const supabase = await createClient()

  // Debug log
  console.log('NEXT_PUBLIC_SITE_URL (loginWithGoogle):', process.env.NEXT_PUBLIC_SITE_URL)

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return {
      type: 'GOOGLE_ERROR',
      message: error.message
    }
  }

  // Debug log
  console.log('Google OAuth redirect URL:', data?.url)

  // Redirect user to Google OAuth consent screen
  redirect(data.url)
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    console.log(error)
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function resendVerificationEmail(email: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email,
  })

  if (error) {
    return { error: error.message }
  }

  return {}
}