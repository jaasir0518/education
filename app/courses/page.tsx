import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Clock, Users, Star, BookOpen, Play, AlertCircle } from 'lucide-react'

// Types
interface Course {
  id: string
  title: string
  description: string
  long_description?: string
  duration: string
  level: string
  thumbnail: string
  instructor: string
  rating: number
  students: number
  enrolled: boolean
  progress: number
  totalLessons: number
  created_at: string
  updated_at: string
}

// Add proper types for the query results
interface LessonProgressResult {
  lesson_id: string
  completed: boolean
  user_id: string
  lessons: {
    id: string
    chapter_id: string
    chapters: {
      course_id: string
    }[]
  }[]
}

interface ChapterWithLessons {
  course_id: string
  lessons: Array<{ id: string }> | null
}

// Enhanced database function with better error handling and debugging
async function getAllActiveCourses(userId: string) {
  const supabase = createServerComponentClient({ cookies })
  
  try {
    // First, let's get all courses with a simpler query
    const { data: coursesData, error: coursesError } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        description,
        long_description,
        duration,
        level,
        thumbnail,
        instructor,
        rating,
        students,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })

    if (coursesError) {
      console.error('Error fetching courses:', coursesError)
      return { enrolledCourses: [], availableCourses: [], allCourses: [], error: 'Failed to fetch courses' }
    }

    // Initialize with safe defaults
    let enrolledCourseIds = new Set<string>()
    let courseProgress = new Map<string, number>()
    let courseLessons = new Map<string, number>()

    // Try to get course lesson counts
    try {
      const { data: chaptersData, error: chaptersError } = await supabase
        .from('chapters')
        .select(`
          course_id,
          lessons (
            id
          )
        `)
        .in('course_id', coursesData.map(c => c.id))

      if (chaptersError) {
        console.warn('Could not fetch lesson counts:', chaptersError)
      } else if (chaptersData) {
        // Type assertion for the chapters data
        const typedChaptersData = chaptersData as ChapterWithLessons[]
        
        typedChaptersData.forEach(chapter => {
          const courseId = chapter.course_id
          const currentCount = courseLessons.get(courseId) || 0
          courseLessons.set(courseId, currentCount + (chapter.lessons?.length || 0))
        })
      }
    } catch (error) {
      console.warn('Could not fetch lesson counts:', error)
    }

    // Try to get user enrollments with enhanced error handling
    try {
      console.log('Fetching enrollments for user:', userId)
      
      // Simple enrollment query first
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', userId)

      if (enrollmentsError) {
        // Better error logging
        console.error('Enrollments error details:', {
          message: enrollmentsError.message || 'No message',
          details: enrollmentsError.details || 'No details',
          hint: enrollmentsError.hint || 'No hint',
          code: enrollmentsError.code || 'No code',
          // Log the full error object
          fullError: JSON.stringify(enrollmentsError, null, 2)
        })
        
        // Check if it's a table/column existence issue
        if (enrollmentsError.code === 'PGRST116' || 
            enrollmentsError.message?.includes('relation') || 
            enrollmentsError.message?.includes('column') ||
            enrollmentsError.message?.includes('does not exist')) {
          console.warn('Enrollments table or columns may not exist. Continuing without enrollment data.')
        } else {
          console.error('Other enrollment error:', enrollmentsError)
        }
      } else if (enrollmentsData) {
        console.log('Successfully fetched enrollments:', enrollmentsData.length)
        enrolledCourseIds = new Set(enrollmentsData.map(e => e.course_id))
      }
    } catch (error) {
      console.error('Unexpected error fetching enrollments:', error)
      // Log the error type and properties
      console.error('Error type:', typeof error)
      console.error('Error properties:', Object.getOwnPropertyNames(error))
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      }
    }

    // Try to get lesson progress for enrolled courses
    if (enrolledCourseIds.size > 0) {
      try {
        console.log('Fetching progress for enrolled courses:', Array.from(enrolledCourseIds))
        
        const { data: progressData, error: progressError } = await supabase
          .from('lesson_progress')
          .select(`
            lesson_id,
            completed,
            user_id,
            lessons!inner (
              id,
              chapter_id,
              chapters!inner (
                course_id
              )
            )
          `)
          .eq('user_id', userId)
          .eq('completed', true)

        if (progressError) {
          console.warn('Could not fetch lesson progress:', {
            message: progressError.message || 'No message',
            details: progressError.details || 'No details',
            hint: progressError.hint || 'No hint',
            code: progressError.code || 'No code',
            fullError: JSON.stringify(progressError, null, 2)
          })
        } else if (progressData) {
          console.log('Successfully fetched progress data:', progressData.length)
          
          // Type assertion for the progress data
          const typedProgressData = progressData as LessonProgressResult[]
          
          const progressByCourse = typedProgressData.reduce((acc, progress) => {
            const courseId = progress.lessons?.[0]?.chapters?.[0]?.course_id
            if (courseId) {
              if (!acc[courseId]) acc[courseId] = 0
              acc[courseId]++
            }
            return acc
          }, {} as Record<string, number>)

          Object.entries(progressByCourse).forEach(([courseId, completedCount]) => {
            const totalLessons = courseLessons.get(courseId) || 1
            const progressPercentage = Math.round((completedCount / totalLessons) * 100)
            courseProgress.set(courseId, Math.min(progressPercentage, 100))
          })
        }
      } catch (error) {
        console.error('Unexpected error fetching lesson progress:', error)
      }
    }

    // Transform data with safe defaults
    const transformedCourses: Course[] = coursesData.map(course => {
      const totalLessons = courseLessons.get(course.id) || 0
      const enrolled = enrolledCourseIds.has(course.id)
      const progress = enrolled ? (courseProgress.get(course.id) || 0) : 0

      return {
        id: course.id,
        title: course.title || 'Untitled Course',
        description: course.description || 'No description available',
        long_description: course.long_description,
        duration: course.duration || 'N/A',
        level: course.level || 'Beginner',
        thumbnail: course.thumbnail || '📚',
        instructor: course.instructor || 'Unknown',
        rating: course.rating || 0,
        students: course.students || 0,
        enrolled,
        progress,
        totalLessons,
        created_at: course.created_at,
        updated_at: course.updated_at
      }
    })

    const enrolledCourses = transformedCourses.filter(course => course.enrolled)
    const availableCourses = transformedCourses.filter(course => !course.enrolled)

    console.log('Course data summary:', {
      total: transformedCourses.length,
      enrolled: enrolledCourses.length,
      available: availableCourses.length
    })

    return { 
      enrolledCourses, 
      availableCourses, 
      allCourses: transformedCourses,
      error: null 
    }

  } catch (error) {
    console.error('Unexpected error in getAllActiveCourses:', error)
    return { 
      enrolledCourses: [], 
      availableCourses: [], 
      allCourses: [], 
      error: 'An unexpected error occurred while fetching courses' 
    }
  }
}

// Debug function to check database schema
async function debugDatabaseSchema() {
  const supabase = createServerComponentClient({ cookies })
  
  try {
    // Test basic table access with more detailed logging
    const tables = ['courses', 'enrollments', 'chapters', 'lessons', 'lesson_progress']
    
    for (const table of tables) {
      try {
        console.log(`Testing access to ${table} table...`)
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          console.error(`Error accessing ${table}:`, {
            message: error.message || 'No message',
            details: error.details || 'No details',
            hint: error.hint || 'No hint',
            code: error.code || 'No code',
            fullError: JSON.stringify(error, null, 2)
          })
        } else {
          console.log(`${table} table accessible:`, data ? `Yes (${data.length} records)` : 'No data')
          if (data && data.length > 0) {
            console.log(`${table} columns:`, Object.keys(data[0]))
          }
        }
      } catch (err) {
        console.error(`Exception accessing ${table}:`, err)
      }
    }

    // Test the specific enrollments table structure
    try {
      console.log('Testing enrollments table structure...')
      const { data: enrollmentTest, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('id, user_id, course_id, created_at')
        .limit(1)
      
      if (enrollmentError) {
        console.error('Enrollments structure test failed:', {
          message: enrollmentError.message || 'No message',
          details: enrollmentError.details || 'No details',
          hint: enrollmentError.hint || 'No hint',
          code: enrollmentError.code || 'No code',
          fullError: JSON.stringify(enrollmentError, null, 2)
        })
      } else {
        console.log('Enrollments table structure test passed')
      }
    } catch (err) {
      console.error('Exception testing enrollments structure:', err)
    }

  } catch (error) {
    console.error('Error in debugDatabaseSchema:', error)
  }
}

// Course Card Component
function CourseCard({ course, isEnrolled = false }: { course: Course; isEnrolled?: boolean }) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="text-3xl flex-shrink-0">{course.thumbnail}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
              <Badge variant={isEnrolled ? "default" : "outline"} className="text-xs">
                {isEnrolled ? "Enrolled" : "Available"}
              </Badge>
            </div>
            <CardDescription className="text-sm mt-1">
              {course.level} • {course.totalLessons} lessons • {course.instructor}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
        
        {/* Course Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{course.students.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>{course.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Progress Bar for Enrolled Courses */}
        {isEnrolled && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">{course.progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Link href={`/courses/${course.id}`} className="flex-1">
            <Button 
              size="sm" 
              className="w-full" 
              variant={isEnrolled ? "default" : "outline"}
            >
              {isEnrolled ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  {course.progress > 0 ? 'Continue' : 'Start'}
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Details
                </>
              )}
            </Button>
          </Link>
          
          {isEnrolled && (
            <Link href={`/courses/${course.id}/learn`}>
              <Button size="sm" variant="ghost">
                <Play className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Error Banner Component
function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <div>
          <h3 className="font-medium text-red-800">Unable to Load Some Data</h3>
          <p className="text-sm text-red-600">{message}</p>
        </div>
      </div>
    </div>
  )
}

// Main Courses Page Component
export default async function CoursesPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Always run debug function to help diagnose issues
  console.log('Running database schema debug...')
  await debugDatabaseSchema()

  const { enrolledCourses, availableCourses, allCourses, error } = await getAllActiveCourses(user.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Learning Dashboard</h1>
              <p className="text-gray-600">
                {enrolledCourses.length > 0 
                  ? `Continue your learning journey • ${enrolledCourses.length} active courses`
                  : 'Start your learning journey with our comprehensive courses'
                }
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search courses..."
                  className="pl-10 w-64"
                />
              </div>
              
              {/* Course Stats */}
              <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">
                <div className="text-center">
                  <div className="font-semibold text-blue-600">{allCourses.length}</div>
                  <div>Total Courses</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-600">{enrolledCourses.length}</div>
                  <div>Enrolled</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-orange-600">{availableCourses.length}</div>
                  <div>Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && <ErrorBanner message={error} />}

        {/* Continue Learning Section */}
        {enrolledCourses.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Continue Learning</h2>
              <Badge variant="secondary" className="text-sm">
                {enrolledCourses.length} active {enrolledCourses.length === 1 ? 'course' : 'courses'}
              </Badge>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <CourseCard key={course.id} course={course} isEnrolled={true} />
              ))}
            </div>
          </div>
        )}

        {/* All Active Courses Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">All Active Courses</h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {allCourses.length} total courses
              </Badge>
              <select className="text-sm border rounded px-3 py-1">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCourses.map((course) => (
              <CourseCard 
                key={course.id} 
                course={course} 
                isEnrolled={course.enrolled}
              />
            ))}
          </div>
          
          {allCourses.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">No Courses Available</h3>
              <p className="text-gray-600">Check back later for new courses or contact support if you believe this is an error.</p>
            </div>
          )}
        </div>

        {/* Quick Stats Footer */}
        {allCourses.length > 0 && (
          <div className="mt-12 pt-8 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{allCourses.length}</div>
                <div className="text-sm text-gray-600">Total Courses</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{enrolledCourses.length}</div>
                <div className="text-sm text-gray-600">Enrolled</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {enrolledCourses.reduce((acc, course) => acc + course.totalLessons, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Lessons</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {enrolledCourses.length > 0 
                    ? Math.round(enrolledCourses.reduce((acc, course) => acc + course.progress, 0) / enrolledCourses.length)
                    : 0}%
                </div>
                <div className="text-sm text-gray-600">Avg Progress</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}