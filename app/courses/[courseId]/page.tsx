import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { EnrollButton } from '@/components/ui/enroll-button'
import { VideoPlayer } from '@/components/ui/video-player'
import { formatDateShort, formatNumber } from '@/lib/date-utils'

// Types
interface Lesson {
  id: string
  title: string
  duration: string
  order_index: number
  completed: boolean
}

interface Chapter {
  id: string
  title: string
  order_index: number
  lessons: Lesson[]
}

interface TestQuestion {
  id: string
  question_text: string
  question_type: string
  options: any
  correct_answer: string
  explanation: string
  difficulty_level: string
  order_index: number
}

interface TestAttempt {
  id: string
  score: number
  total_questions: number
  correct_answers: number
  passing_score: number
  passed: boolean
  completed_at: string
  time_taken: number
}

interface VideoProgress {
  id: string
  user_id: string
  course_id: string
  current_time: number
  duration: number
  completed: boolean
  watch_percentage: number
  created_at: string
  updated_at: string
}

interface CourseDetail {
  id: string
  title: string
  description: string
  long_description: string
  duration: string
  level: string
  thumbnail: string
  instructor: string
  rating: number
  students: number
  created_at: string
  video_url: string | null
  video_thumbnail_url: string | null
  video_duration: number | null
  chapters: Chapter[]
  enrolled: boolean
  video_completed: boolean
  video_progress: VideoProgress | null
  test_questions: TestQuestion[]
  latest_test_attempt: TestAttempt | null
  test_passed: boolean
}

interface Certificate {
  id: string
  certificate_number: string
  first_name: string
  last_name: string
  issued_date: string
  completion_date: string
}

interface UserProfile {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
}

// Database functions
async function getCourseById(courseId: string, userId: string): Promise<CourseDetail | null> {
  const supabase = createServerComponentClient({ cookies })
  
  // Get course with chapters and lessons
  const { data: courseData, error: courseError } = await supabase
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
      video_url,
      video_thumbnail_url,
      video_duration,
      chapters (
        id,
        title,
        order_index,
        lessons (
          id,
          title,
          duration,
          order_index
        )
      )
    `)
    .eq('id', courseId)
    .single()

  if (courseError || !courseData) {
    console.error('Error fetching course:', courseError)
    return null
  }

  // Check if user is enrolled
  const { data: enrollmentData, error: enrollmentError } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single()

  const enrolled = !enrollmentError && enrollmentData

  // Get lesson progress if enrolled
  let lessonProgress: Record<string, boolean> = {}
  if (enrolled) {
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
      .eq('lessons.chapters.course_id', courseId)

    if (!progressError && progressData) {
      lessonProgress = progressData.reduce((acc, progress) => {
        acc[progress.lesson_id] = progress.completed
        return acc
      }, {} as Record<string, boolean>)
    }
  }

  // Get video progress with more detailed information
  const { data: videoProgress, error: videoError } = await supabase
    .from('video_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single()

  const videoCompleted = !videoError && videoProgress && videoProgress.watch_percentage >= 90

  // Get test questions
  const { data: testQuestions, error: testError } = await supabase
    .from('test_questions')
    .select('*')
    .eq('course_id', courseId)
    .order('order_index')

  // Get latest test attempt
  const { data: latestAttempt, error: attemptError } = await supabase
    .from('test_attempts')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Transform data
  const transformedCourse: CourseDetail = {
    id: courseData.id,
    title: courseData.title,
    description: courseData.description,
    long_description: courseData.long_description || courseData.description,
    duration: courseData.duration,
    level: courseData.level,
    thumbnail: courseData.thumbnail,
    instructor: courseData.instructor,
    rating: courseData.rating,
    students: courseData.students,
    created_at: courseData.created_at,
    video_url: courseData.video_url,
    video_thumbnail_url: courseData.video_thumbnail_url,
    video_duration: (videoProgress?.duration && videoProgress.duration > 0) 
      ? videoProgress.duration 
      : courseData.video_duration,
    enrolled: !!enrolled,
    video_completed: videoCompleted,
    video_progress: videoProgress || null,
    test_questions: testQuestions || [],
    latest_test_attempt: latestAttempt || null,
    test_passed: latestAttempt?.passed || false,
    chapters: courseData.chapters
      .sort((a, b) => a.order_index - b.order_index)
      .map(chapter => ({
        id: chapter.id,
        title: chapter.title,
        order_index: chapter.order_index,
        lessons: chapter.lessons
          .sort((a, b) => a.order_index - b.order_index)
          .map(lesson => ({
            id: lesson.id,
            title: lesson.title,
            duration: lesson.duration,
            order_index: lesson.order_index,
            completed: lessonProgress[lesson.id] || false
          }))
      }))
  }

  return transformedCourse
}

async function getUserCertificate(userId: string, courseId: string): Promise<Certificate | null> {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: certificate, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single()

  if (error || !certificate) {
    return null
  }

  return certificate
}

async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    return null
  }

  return profile
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0:00'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
}

function formatTimeSpent(seconds: number): string {
  if (!seconds || seconds <= 0) return '0s'
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  } else {
    return `${remainingSeconds}s`
  }
}

// Updated interface for Next.js 15
interface CourseDetailPageProps {
  params: Promise<{
    courseId: string
  }>
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  // Await the params Promise
  const resolvedParams = await params
  const { courseId } = resolvedParams
  
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const course = await getCourseById(courseId, user.id)
  const userProfile = await getUserProfile(user.id)

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

  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  // Get existing certificate if any
  const existingCertificate = await getUserCertificate(user.id, course.id)

  // Test-related variables
  const hasTestQuestions = course.test_questions.length > 0
  const hasAttemptedTest = course.latest_test_attempt !== null
  const hasPassedTest = course.test_passed

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Open Source Badge */}
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🌟</span>
            <h2 className="text-lg font-semibold text-blue-800">Open Source Course</h2>
          </div>
          <p className="text-sm text-blue-700">
            This course is now open source! 
            {hasTestQuestions 
              ? ' Complete the test to enhance your learning experience.' 
              : ' Learn at your own pace and test your knowledge.'
            }
            Learn at your own pace and get recognized for your participation.
          </p>
        </div>

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
            {/* Course Video Section */}
            {course.video_url && (
              <Card className="mb-8">
                <CardContent className="p-0 relative">
                  <VideoPlayer
                    videoUrl={course.video_url}
                    thumbnailUrl={course.video_thumbnail_url}
                    title={course.title}
                    enrolled={course.enrolled}
                    courseId={course.id}
                    userId={user.id}
                    initialProgress={course.video_progress}
                  />
                </CardContent>
              </Card>
            )}

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
                <Badge variant="outline">{totalLessons} lessons</Badge>
                <Badge variant="outline">{course.duration}</Badge>
                {course.video_duration && course.video_duration > 0 && (
                  <Badge variant="outline">🎥 {formatDuration(course.video_duration)}</Badge>
                )}
                {hasTestQuestions && (
                  <Badge variant="outline">📝 {course.test_questions.length} questions</Badge>
                )}
                <Badge variant="outline">⭐ {course.rating}</Badge>
                <Badge variant="default" className="bg-green-500">
                  🌟 Open Source
                </Badge>
                {course.video_completed && (
                  <Badge variant="default" className="bg-green-500">
                    ✅ Video Completed
                  </Badge>
                )}
                {course.video_progress && course.video_progress.watch_percentage > 0 && !course.video_completed && (
                  <Badge variant="outline" className="bg-blue-100">
                    📺 {Math.round(course.video_progress.watch_percentage)}% watched
                  </Badge>
                )}
                {hasAttemptedTest && (
                  <Badge variant="default" className="bg-purple-500">
                    ✅ Test Completed
                  </Badge>
                )}
                {course.test_passed && (
                  <Badge variant="default" className="bg-green-500">
                    ✅ Test Passed
                  </Badge>
                )}
                {existingCertificate && (
                  <Badge variant="default" className="bg-blue-500">
                    🏆 Certificate Earned
                  </Badge>
                )}
              </div>

              {/* Video Progress */}
              {course.video_progress && course.video_progress.watch_percentage > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Video Progress</span>
                    <span className="text-sm text-gray-600">{Math.round(course.video_progress.watch_percentage)}% watched</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-purple-500 rounded-full transition-all duration-300"
                      style={{ width: `${course.video_progress.watch_percentage}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Test Section */}
            {hasTestQuestions && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📝 Course Test
                    {hasAttemptedTest && (
                      <Badge variant="default" className="bg-purple-500">
                        ✅ Completed
                      </Badge>
                    )}
                    {course.test_passed && (
                      <Badge variant="default" className="bg-green-500">
                        ✅ Passed
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Test your knowledge with {course.test_questions.length} questions.
                    {hasAttemptedTest && (
                      <span>
                        {' '}You can retake the test anytime to improve your score.
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {course.latest_test_attempt && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Latest Test Result</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Score</p>
                          <p className={`font-bold ${course.latest_test_attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {course.latest_test_attempt.score}%
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Correct Answers</p>
                          <p className="font-medium">
                            {course.latest_test_attempt.correct_answers}/{course.latest_test_attempt.total_questions}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Time Taken</p>
                          <p className="font-medium">
                            {course.latest_test_attempt.time_taken 
                              ? formatTimeSpent(course.latest_test_attempt.time_taken)
                              : 'N/A'
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Status</p>
                          <p className={`font-medium ${course.latest_test_attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {course.latest_test_attempt.passed ? 'Passed' : 'Failed'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button asChild>
                      <Link href={`/courses/${course.id}/test`}>
                        {course.latest_test_attempt ? 'Retake Test' : 'Take Test'}
                      </Link>
                    </Button>
                    {course.latest_test_attempt && (
                      <Button variant="outline" asChild>
                        <Link href={`/courses/${course.id}/test/results`}>
                          View Results
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Course Description */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>About This Course</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {course.long_description}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Instructor</p>
                    <p className="font-medium">{course.instructor}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Students</p>
                    <p className="font-medium">{formatNumber(course.students)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Updated</p>
                    <p className="font-medium">{formatDateShort(course.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Language</p>
                    <p className="font-medium">English</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Take Test Button */}
                  <Button className="w-full bg-blue-500 hover:bg-blue-600" size="lg" asChild>
                    <Link href="http://localhost:3000/test">
                      📝 Take Test
                    </Link>
                  </Button>

                  {/* Enrollment button for non-enrolled users */}
                  {!course.enrolled && (
                    <EnrollButton courseId={course.id} />
                  )}

                  <Button variant="outline" className="w-full">
                    Download Materials
                  </Button>
                  <Button variant="outline" className="w-full">
                    Ask Question
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold mb-3">This course includes:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span>📹</span>
                      <span>{course.duration} of video content</span>
                    </div>
                    {course.video_duration && course.video_duration > 0 && (
                      <div className="flex items-center gap-2">
                        <span>🎬</span>
                        <span>Course preview ({formatDuration(course.video_duration)})</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span>📝</span>
                      <span>{totalLessons} lessons</span>
                    </div>
                    {hasTestQuestions && (
                      <div className="flex items-center gap-2">
                        <span>🧪</span>
                        <span>Course test ({course.test_questions.length} questions)</span>
                      </div>
                    )}
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