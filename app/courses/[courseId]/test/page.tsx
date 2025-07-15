// app/courses/[courseId]/test/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { TestComponent } from '@/components/ui/test-component'

interface TestQuestion {
  id: string
  question_text: string
  question_type: 'multiple_choice' | 'true_false' | 'short_answer'
  options: Record<string, string> | null
  correct_answer: string
  explanation: string | null
  difficulty_level: 'easy' | 'medium' | 'hard'
  order_index: number
}

interface Course {
  id: string
  title: string
  instructor: string
  description?: string
}

interface TestPageProps {
  params: {
    courseId: string
  }
}

async function getCourseTestQuestions(courseId: string): Promise<TestQuestion[]> {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: questions, error } = await supabase
    .from('test_questions')
    .select('*')
    .eq('course_id', courseId)
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching test questions:', error)
    return []
  }

  return questions || []
}

async function getCourseInfo(courseId: string): Promise<Course | null> {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: course, error } = await supabase
    .from('courses')
    .select('id, title, instructor, description')
    .eq('id', courseId)
    .single()

  if (error) {
    console.error('Error fetching course info:', error)
    return null
  }

  return course
}

async function checkUserEnrollment(courseId: string, userId: string): Promise<boolean> {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: enrollment, error } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single()

  return !error && !!enrollment
}

async function getVideoProgress(courseId: string, userId: string): Promise<boolean> {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: progress, error } = await supabase
    .from('video_progress')
    .select('completed')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single()

  return !error && progress?.completed
}

async function getExistingAttempts(courseId: string, userId: string): Promise<any[]> {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: attempts, error } = await supabase
    .from('test_attempts')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .order('created_at', { ascending: false })

  return !error && attempts ? attempts : []
}

async function checkPassedTest(courseId: string, userId: string): Promise<boolean> {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: attempt, error } = await supabase
    .from('test_attempts')
    .select('passed')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('passed', true)
    .single()

  return !error && !!attempt
}

export default async function TestPage({ params }: TestPageProps) {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get course info first
  const course = await getCourseInfo(params.courseId)
  
  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Check if user is enrolled in the course
  const isEnrolled = await checkUserEnrollment(params.courseId, user.id)
  if (!isEnrolled) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need to be enrolled in this course to take the test.</p>
          <a 
            href={`/courses/${params.courseId}`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded inline-block"
          >
            View Course
          </a>
        </div>
      </div>
    )
  }

  // Check if user has completed the video
  const videoCompleted = await getVideoProgress(params.courseId, user.id)
  if (!videoCompleted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Complete Course First</h1>
          <p className="text-gray-600 mb-4">You need to complete the course content before taking the test.</p>
          <a 
            href={`/courses/${params.courseId}`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded inline-block"
          >
            Continue Course
          </a>
        </div>
      </div>
    )
  }

  // Check if user has already passed the test
  const hasPassedTest = await checkPassedTest(params.courseId, user.id)
  if (hasPassedTest) {
    const attempts = await getExistingAttempts(params.courseId, user.id)
    const passedAttempt = attempts.find(attempt => attempt.passed)
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">✅ Test Already Passed!</h1>
          <p className="text-gray-600 mb-4">
            You have already passed the test for "{course.title}" with a score of {passedAttempt?.score}%.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              Completed on: {new Date(passedAttempt?.completed_at).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500">
              Time taken: {Math.floor(passedAttempt?.time_taken / 60)}:{(passedAttempt?.time_taken % 60).toString().padStart(2, '0')}
            </p>
          </div>
          <a 
            href={`/courses/${params.courseId}`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded inline-block mt-4"
          >
            Return to Course
          </a>
        </div>
      </div>
    )
  }

  // Get test questions
  const questions = await getCourseTestQuestions(params.courseId)

  if (questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Test Not Available</h1>
          <p className="text-gray-600 mb-4">
            The test for "{course.title}" is not available yet. Please check back later.
          </p>
          <a 
            href={`/courses/${params.courseId}`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded inline-block"
          >
            Return to Course
          </a>
        </div>
      </div>
    )
  }

  // Get previous attempts for context
  const previousAttempts = await getExistingAttempts(params.courseId, user.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Show previous attempts if any */}
        {previousAttempts.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Previous Attempts</h3>
            <div className="space-y-2">
              {previousAttempts.map((attempt, index) => (
                <div key={attempt.id} className="flex justify-between items-center text-sm">
                  <span className="text-yellow-700">
                    Attempt {index + 1}: {attempt.score}% 
                    {attempt.passed ? ' (Passed)' : ' (Failed)'}
                  </span>
                  <span className="text-yellow-600">
                    {new Date(attempt.completed_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <TestComponent
          course={course}
          questions={questions}
          userId={user.id}
        />
      </div>
    </div>
  )
}