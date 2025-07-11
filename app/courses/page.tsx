import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Mock data - replace with actual data fetching
const courses = [
  {
    id: 1,
    title: "JavaScript Fundamentals",
    description: "Learn the basics of JavaScript programming language",
    duration: "8 hours",
    lessons: 24,
    level: "Beginner",
    progress: 75,
    thumbnail: "🟨",
    enrolled: true
  },
  {
    id: 2,
    title: "React Advanced Patterns",
    description: "Master advanced React patterns and best practices",
    duration: "12 hours",
    lessons: 36,
    level: "Advanced",
    progress: 45,
    thumbnail: "⚛️",
    enrolled: true
  },
  {
    id: 3,
    title: "Next.js 14 Mastery",
    description: "Build production-ready applications with Next.js 14",
    duration: "16 hours",
    lessons: 48,
    level: "Intermediate",
    progress: 0,
    thumbnail: "🔺",
    enrolled: false
  },
  {
    id: 4,
    title: "TypeScript Deep Dive",
    description: "Advanced TypeScript concepts and enterprise patterns",
    duration: "10 hours",
    lessons: 30,
    level: "Advanced",
    progress: 0,
    thumbnail: "🔷",
    enrolled: false
  },
  {
    id: 5,
    title: "Node.js Backend Development",
    description: "Build scalable backend applications with Node.js",
    duration: "14 hours",
    lessons: 42,
    level: "Intermediate",
    progress: 0,
    thumbnail: "🟢",
    enrolled: false
  },
  {
    id: 6,
    title: "Database Design & SQL",
    description: "Master database design principles and SQL queries",
    duration: "6 hours",
    lessons: 18,
    level: "Beginner",
    progress: 0,
    thumbnail: "🗄️",
    enrolled: false
  }
]

export default async function CoursesPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const enrolledCourses = courses.filter(course => course.enrolled)
  const availableCourses = courses.filter(course => !course.enrolled)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">My Courses</h1>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <p className="text-gray-600">
              Continue your learning journey with our comprehensive courses
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Search courses..."
                className="w-64"
              />
            </div>
          </div>
        </div>

        {/* My Enrolled Courses */}
        {enrolledCourses.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Continue Learning</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{course.thumbnail}</div>
                      <div>
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {course.level} • {course.lessons} lessons
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{course.description}</p>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-gray-600">{course.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{course.duration}</span>
                      <Link href={`/courses/${course.id}`}>
                        <Button size="sm">
                          {course.progress > 0 ? 'Continue' : 'Start'}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Available Courses */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Available Courses</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{course.thumbnail}</div>
                    <div>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {course.level} • {course.lessons} lessons
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{course.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{course.duration}</span>
                    <Link href={`/courses/${course.id}`}>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}