import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function HomePage() {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Welcome back, {user.email?.split('@')[0]}!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Continue your learning journey with our comprehensive courses
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📚 My Courses
              </CardTitle>
              <CardDescription>
                Continue where you left off
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/courses">
                <Button className="w-full">View All Courses</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 Dashboard
              </CardTitle>
              <CardDescription>
                Track your progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard">
                <Button className="w-full" variant="outline">Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                👤 Profile
              </CardTitle>
              <CardDescription>
                Manage your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/profile">
                <Button className="w-full" variant="outline">Edit Profile</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Recent Activity</h2>
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">JavaScript Fundamentals</h3>
                    <p className="text-sm text-gray-600">Last accessed 2 days ago</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Progress: 75%</p>
                    <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                      <div className="w-3/4 h-full bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">React Advanced Patterns</h3>
                    <p className="text-sm text-gray-600">Last accessed 1 week ago</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Progress: 45%</p>
                    <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                      <div className="w-2/5 h-full bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Featured Courses */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Featured Courses</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Next.js 14 Mastery</CardTitle>
                <CardDescription>
                  Master the latest Next.js features and build production-ready apps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">12 lessons • 4 hours</span>
                  <Button size="sm">Start Learning</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>TypeScript Deep Dive</CardTitle>
                <CardDescription>
                  Advanced TypeScript concepts and best practices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">15 lessons • 6 hours</span>
                  <Button size="sm">Start Learning</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}