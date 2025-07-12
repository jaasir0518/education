import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Types
interface Course {
  id: string
  title: string
  description: string
  duration: string
  level: string
  thumbnail: string
  instructor: string
  rating: number
  students: number
  enrolled: boolean
  progress: number
  totalLessons: number
}

// Database functions
async function getCourses(userId: string) {
  const supabase = createServerComponentClient({ cookies })
  
  // Get all courses with enrollment status
  const { data: coursesData, error: coursesError } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      description,
      duration,
      level,
      thumbnail,
      instructor,
      rating,
      students,
      chapters!inner (
        id,
        lessons!inner (
          id
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (coursesError) {
    console.error('Error fetching courses:', coursesError)
    return { enrolledCourses: [], availableCourses: [] }
  }

  // Get user enrollments
  const { data: enrollmentsData, error: enrollmentsError } = await supabase
    .from('enrollments')
    .select('course_id')
    .eq('user_id', userId)

  if (enrollmentsError) {
    console.error('Error fetching enrollments:', enrollmentsError)
  }

  const enrolledCourseIds = new Set(enrollmentsData?.map(e => e.course_id) || [])

  // Get lesson progress for enrolled courses
  const { data: progressData, error: progressError } = await supabase
    .from('lesson_progress')
    .select(`
      lesson_id,
      completed,
      lessons!inner (
        id,
        chapters!inner (
          course_id
        )
      )
    `)
    .eq('user_id', userId)
    .eq('completed', true)

  if (progressError) {
    console.error('Error fetching progress:', progressError)
  }

  // Calculate progress for each course
  const courseProgress = new Map<string, number>()
  
  if (progressData) {
    const progressByCourse = progressData.reduce((acc, progress) => {
      const courseId = progress.lessons[0].chapters[0].course_id
      if (!acc[courseId]) acc[courseId] = 0
      acc[courseId]++
      return acc
    }, {} as Record<string, number>)

    Object.entries(progressByCourse).forEach(([courseId, completedCount]) => {
      const course = coursesData?.find(c => c.id === courseId)
      if (course) {
        const totalLessons = course.chapters.reduce((total, chapter) => total + chapter.lessons.length, 0)
        const progressPercentage = Math.round((completedCount / totalLessons) * 100)
        courseProgress.set(courseId, progressPercentage)
      }
    })
  }

  // Transform data
  const transformedCourses: Course[] = (coursesData || []).map(course => {
    const totalLessons = course.chapters.reduce((total, chapter) => total + chapter.lessons.length, 0)
    const enrolled = enrolledCourseIds.has(course.id)
    const progress = enrolled ? (courseProgress.get(course.id) || 0) : 0

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      duration: course.duration,
      level: course.level,
      thumbnail: course.thumbnail,
      instructor: course.instructor,
      rating: course.rating,
      students: course.students,
      enrolled,
      progress,
      totalLessons
    }
  })

  const enrolledCourses = transformedCourses.filter(course => course.enrolled)
  const availableCourses = transformedCourses.filter(course => !course.enrolled)

  return { enrolledCourses, availableCourses }
}

export default async function CoursesPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { enrolledCourses, availableCourses } = await getCourses(user.id)

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
                          {course.level} • {course.totalLessons} lessons
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
                        {course.level} • {course.totalLessons} lessons
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