import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { TestInterface } from '@/components/ui/test-interface'

// Types
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

interface CourseInfo {
  id: string
  title: string
  instructor: string
  thumbnail: string
}

interface TestPageData {
  course: CourseInfo
  questions: TestQuestion[]
  latestAttempt: TestAttempt | null
  hasExistingCertificate: boolean
}

// Database functions
async function getTestData(courseId: string, userId: string): Promise<TestPageData | null> {
  const supabase = createServerComponentClient({ cookies })
  
  // Get course info
  const { data: courseData, error: courseError } = await supabase
    .from('courses')
    .select('id, title, instructor, thumbnail')
    .eq('id', courseId)
    .single()

  if (courseError || !courseData) {
    console.error('Error fetching course:', courseError)
    return null
  }

  // Get test questions
  const { data: questions, error: questionsError } = await supabase
    .from('test_questions')
    .select('*')
    .eq('course_id', courseId)
    .order('order_index')

  if (questionsError || !questions || questions.length === 0) {
    console.error('Error fetching test questions:', questionsError)
    return null
  }

  // Get latest test attempt
  const { data: latestAttempt, error: attemptError } = await supabase
    .from('test_attempts')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Check if user already has a certificate
  const { data: certificate, error: certError } = await supabase
    .from('certificates')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single()

  return {
    course: courseData,
    questions: questions,
    latestAttempt: latestAttempt || null,
    hasExistingCertificate: !certError && !!certificate
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

interface TestPageProps {
  params: {
    courseId: string
  }
}

export default async function TestPage({ params }: TestPageProps) {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const testData = await getTestData(params.courseId, user.id)

  if (!testData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Test Not Available</h1>
          <p className="text-gray-600 mb-4">This course doesn't have a test or the test couldn't be loaded.</p>
          <Link href={`/courses/${params.courseId}`}>
            <Button>Back to Course</Button>
          </Link>
        </div>
      </div>
    )
  }

  const { course, questions, latestAttempt, hasExistingCertificate } = testData

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/courses" className="hover:text-gray-900">Courses</Link>
            <span>›</span>
            <Link href={`/courses/${course.id}`} className="hover:text-gray-900">{course.title}</Link>
            <span>›</span>
            <span>Test</span>
          </div>
        </nav>

        {/* Course Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">{course.thumbnail}</div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{course.title} - Test</h1>
              <p className="text-gray-600">Test your knowledge with {questions.length} questions</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline">📝 {questions.length} questions</Badge>
            <Badge variant="outline">👨‍🏫 {course.instructor}</Badge>
            {latestAttempt && (
              <Badge variant="default" className="bg-purple-500">
                ✅ Previously Completed
              </Badge>
            )}
            {latestAttempt?.passed && (
              <Badge variant="default" className="bg-green-500">
                ✅ Passed
              </Badge>
            )}
            {hasExistingCertificate && (
              <Badge variant="default" className="bg-blue-500">
                🏆 Certificate Earned
              </Badge>
            )}
          </div>
        </div>

        {/* Previous Attempt Results */}
        {latestAttempt && (
          <Card className="mb-8 border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                📊 Previous Test Result
              </CardTitle>
              <CardDescription className="text-purple-700">
                Your latest test attempt results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white border border-purple-200 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Score</p>
                    <p className={`font-bold text-lg ${latestAttempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {latestAttempt.score}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Correct Answers</p>
                    <p className="font-medium text-lg">
                      {latestAttempt.correct_answers}/{latestAttempt.total_questions}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Time Taken</p>
                    <p className="font-medium text-lg">
                      {latestAttempt.time_taken 
                        ? formatTimeSpent(latestAttempt.time_taken)
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <p className={`font-medium text-lg ${latestAttempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {latestAttempt.passed ? 'Passed' : 'Failed'}
                    </p>
                  </div>
                </div>
                
                {latestAttempt.passed && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm">
                      🎉 Congratulations! You passed the test. 
                      {!hasExistingCertificate && (
                        <span> You can now generate your certificate from the course page!</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Instructions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Test Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p>• Read each question carefully before selecting your answer</p>
              <p>• You can change your answers before submitting</p>
              <p>• There is no time limit - take your time to think through each question</p>
              <p>• You need to score at least 70% to pass the test</p>
              <p>• You can retake the test as many times as you want</p>
              <p>• After passing, you'll be able to generate your certificate of completion</p>
            </div>
          </CardContent>
        </Card>

        {/* Test Interface */}
        <Card>
          <CardHeader>
            <CardTitle>
              {latestAttempt ? 'Retake Test' : 'Start Test'}
            </CardTitle>
            <CardDescription>
              Answer all {questions.length} questions to complete the test
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TestInterface
              questions={questions}
              courseId={course.id}
              userId={user.id}
              courseTitle={course.title}
            />
          </CardContent>
        </Card>

        {/* Back to Course */}
        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link href={`/courses/${course.id}`}>
              ← Back to Course
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}