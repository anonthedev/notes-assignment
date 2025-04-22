import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8 bg-card rounded-lg shadow-lg text-center">
        <div>
          <h2 className="text-2xl font-bold text-destructive">Authentication Error</h2>
          <p className="mt-2 text-muted-foreground">
            There was a problem with your authentication. Please try again.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link href="/login">
            <Button className="w-full">Return to Login</Button>
          </Link>
          
          <Link href="/">
            <Button variant="outline" className="w-full">Go to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 