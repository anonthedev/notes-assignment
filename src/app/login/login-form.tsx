'use client'

import { Input } from '@/components/ui/input'
import { login, loginWithGoogle, resendVerificationEmail } from './actions'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  async function handleLogin(formData: FormData) {
    setIsLoading(true)
    const error = await login(formData)
    
    if (error) {
      setIsLoading(false)
      switch (error.type) {
        case 'INVALID_CREDENTIALS':
          toast.error(() => (
            <div className="flex flex-col gap-2">
              <p className="font-medium">Invalid credentials</p>
              <p className="text-sm text-muted-foreground">Please check your email and password</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => router.refresh()}
              >
                Try Again
              </Button>
            </div>
          ))
          break
          
        case 'EMAIL_NOT_VERIFIED':
          toast.error(() => (
            <div className="flex flex-col gap-2">
              <p className="font-medium">Email not verified</p>
              <p className="text-sm text-muted-foreground">Please check your inbox for the verification link</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={async () => {
                  if (error.email) {
                    const result = await resendVerificationEmail(error.email)
                    if (result.error) {
                      toast.error('Failed to resend verification email')
                    } else {
                      toast.success('Verification email sent')
                    }
                  }
                }}
              >
                Resend Verification Email
              </Button>
            </div>
          ))
          break
          
        default:
          toast.error(() => (
            <div className="flex flex-col gap-2">
              <p className="font-medium">Authentication failed</p>
              <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
          ))
      }
    } else {
      setIsLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setIsGoogleLoading(true)
    const error = await loginWithGoogle()
    
    if (error) {
      setIsGoogleLoading(false)
      toast.error(() => (
        <div className="flex flex-col gap-2">
          <p className="font-medium">Google login failed</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      ))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8 bg-card rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Welcome back</h2>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>
        
        <form action={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">Email</label>
              <Input id="email" name="email" type="email" required className="mt-1" />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium">Password</label>
              <Input id="password" name="password" type="password" required className="mt-1" />
            </div>
          </div>

          <div className="space-y-4">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleGoogleLogin}
              type="button"
              disabled={isGoogleLoading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {isGoogleLoading ? "Signing in with Google..." : "Sign in with Google"}
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
} 