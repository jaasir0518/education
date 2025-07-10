import Link from 'next/link'
import { Button } from '../components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Welcome to Auth App
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          A secure authentication system built with Next.js and Supabase
        </p>
        <div className="space-x-4">
          <Link href="/auth/login">
            <Button size="lg">Sign In</Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="outline" size="lg">Sign Up</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}