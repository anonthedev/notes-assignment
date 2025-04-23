'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type SignupError = {
  type: 'USER_EXISTS' | 'INVALID_PASSWORD' | 'INVALID_EMAIL' | 'GOOGLE_ERROR' | 'OTHER'
  message: string
}

export async function signup(formData: FormData): Promise<SignupError | undefined> {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    if (error.message.includes('User already registered')) {
      return {
        type: 'USER_EXISTS',
        message: 'An account with this email already exists'
      }
    }

    if (error.message.includes('Password should be')) {
      return {
        type: 'INVALID_PASSWORD',
        message: 'Password should be at least 6 characters long'
      }
    }

    if (error.message.includes('Invalid email')) {
      return {
        type: 'INVALID_EMAIL',
        message: 'Please enter a valid email address'
      }
    }

    return {
      type: 'OTHER',
      message: error.message
    }
  }

  redirect('/login')
}

export async function signupWithGoogle(): Promise<SignupError | undefined> {
  const supabase = await createClient()

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

  // Redirect user to Google OAuth consent screen
  redirect(data.url)
}