import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

// Mock data - replace with actual data fetching
const getCourseById = (id: string) => {
  const courses = {
    "1": {
      id: 1,
      title: "JavaScript Fundamentals",
      description: "Master the fundamentals of JavaScript programming language from scratch. This comprehensive course covers everything you need to know to start your web development journey.",
      longDescription: "This course is designed for complete beginners who want to learn JavaScript from the ground up. We'll start with the basics like variables, data types, and functions, then move on to more advanced topics like objects, arrays, and DOM manipulation. By the end of this course, you'll have a solid foundation in JavaScript and be ready to tackle more advanced topics.",
      duration: "8 hours",
      lessons: 24,
      level: "Beginner",
      progress: 75,
      thumbnail: "🟨",
      enrolled: true,
      instructor: "John Smith",
      rating: 4.8,
      students: 1234,
      lastUpdated: "2024-01-15",
      chapters: [
        {
          id: 1,
          title: "Introduction to JavaScript",
          lessons: [
            { id: 2, title: "Setting up Development Environment", duration: "15 min", completed: true },
            { id: 3, title: "Your First JavaScript Program", duration: "12 min", completed: true },
          ]
        },
        {
          id: 2,
          title: "Variables and Data Types",
          lessons: [
            { id: 4, title: "Understanding Variables", duration: "20 min", completed: true },
            { id: 5, title: "Numbers and Strings", duration: "18 min", completed: true },
            { id: 6, title: "Booleans and Arrays", duration: "22 min", completed: false },
            { id: 7, title: "Objects Introduction", duration: "25 min", completed: false },
          ]
        },
        {
          id: 3,
          title: "Functions and Control Flow",
          lessons: [
            { id: 8, title: "Function Basics", duration: "20 min", completed: false },
            { id: 9, title: "If Statements", duration: "15 min", completed: false },
            { id: 10, title: "Loops", duration: "30 min", completed: false },
          ]
        },
        {
          id: 4,
          title: "DOM Manipulation",
          lessons: [
            { id: 11, title: "What is the DOM?", duration: "18 min", completed: false },
            { id: 12, title: "Selecting Elements", duration: "22 min", completed: false },
            { id: 13, title: "Modifying Elements", duration: "25 min", completed: false },
            { id: 14, title: "Event Handling", duration: "30 min", completed: false },
          ]
        }
      ]
    },
    "2": {
      id: 2,
      title: "React Advanced Patterns",
      description: "Master advanced React patterns and best practices for building scalable applications.",
      longDescription: "Take your React skills to the next level with this advanced course covering compound components, render props, higher-order components, and modern hooks patterns.",
      duration: "12 hours",
      lessons: 36,
      level: "Advanced",
      progress: 45,
      thumbnail: "⚛️",
      enrolled: true,
      instructor: "Jane Doe",
      rating: 4.9,
      students: 892,
      lastUpdated: "2024-01-20",
      chapters: [
        {
          id: 1,
          title: "Advanced Component Patterns",
          lessons: [
            { id: 1, title: "Compound Components", duration: "25 min", completed: true },
            { id: 2, title: "Render Props Pattern", duration: "30 min", completed: true },
            { id: 3, title: "Higher-Order Components", duration: "35 min", completed: false },
          ]
        }
      ]
    }
  }
  
  return courses[id as keyof typeof courses] || null
}

interface CourseDetailPageProps {
  params: {
    courseId: string
  }
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const course = getCourseById(params.courseId)

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
          <Link href="/courses">
            <Button>Back to Courses</Button>
          </Link>
        </div>
      </div>
    )
  }

  const completedLessons = course.chapters.reduce((total, chapter) => {
    return total + chapter.lessons.filter(lesson => lesson.completed).length
  }, 0)

  const totalLessons = course.chapters.reduce((total, chapter) => {
    return total + chapter.lessons.length
  }, 0)

  const progressPercentage = Math.round((completedLessons / totalLessons) * 100)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/courses" className="hover:text-gray-900">Courses</Link>
            <span>›</span>
            <span>{course.title}</span>
          </div>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl">{course.thumbnail}</div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                  <p className="text-gray-600">{course.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">{course.level}</Badge>
                <Badge variant="outline">{course.lessons} lessons</Badge>
                <Badge variant="outline">{course.duration}</Badge>
                <Badge variant="outline">⭐ {course.rating}</Badge>
              </div>

              {course.enrolled && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Your Progress</span>
                    <span className="text-sm text-gray-600">{progressPercentage}% Complete</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Course Description */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>About This Course</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {course.longDescription}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Instructor</p>
                    <p className="font-medium">{course.instructor}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Students</p>
                    <p className="font-medium">{course.students.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Updated</p>
                    <p className="font-medium">{new Date(course.lastUpdated).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Language</p>
                    <p className="font-medium">English</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Content */}
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <CardDescription>
                  {course.chapters.length} chapters • {totalLessons} lessons • {course.duration} total
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {course.chapters.map((chapter) => (
                    <div key={chapter.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-3">{chapter.title}</h3>
                      <div className="space-y-2">
                        {chapter.lessons.map((lesson) => (
                          <div key={lesson.id} className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded">
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                lesson.completed ? 'bg-green-500' : 'bg-gray-300'
                              }`}>
                                {lesson.completed && (
                                  <span className="text-white text-xs">✓</span>
                                )}
                              </div>
                              <span className={`text-sm ${lesson.completed ? 'text-gray-900' : 'text-gray-600'}`}>
                                {lesson.title}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">{lesson.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                {course.enrolled ? (
                  <div className="space-y-4">
                    <Button className="w-full" size="lg">
                      Continue Learning
                    </Button>
                    <Button variant="outline" className="w-full">
                      Download Materials
                    </Button>
                    <Button variant="outline" className="w-full">
                      Ask Question
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Button className="w-full" size="lg">
                      Enroll Now
                    </Button>
                    <Button variant="outline" className="w-full">
                      Preview Course
                    </Button>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold mb-3">This course includes:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span>📹</span>
                      <span>{course.duration} of video content</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📝</span>
                      <span>{course.lessons} lessons</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📱</span>
                      <span>Access on mobile and desktop</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🏆</span>
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>♾️</span>
                      <span>Lifetime access</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  </div>
)
}