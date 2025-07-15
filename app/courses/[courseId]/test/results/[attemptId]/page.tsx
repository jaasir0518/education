// app/courses/[courseId]/test/results/[attemptId]/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Clock, Award, BarChart3 } from 'lucide-react'

interface TestResultsPageProps {
  params: {
    courseId: string
    attemptId: string
  }
}

interface TestAttempt {
  id: string
  user_id: string
  course_id: string
  score: number
  total_questions: number
  correct_answers: number
  passing_score: number
  passed: boolean
  started_at: string
  completed_at: string
  time_taken: number
  answers: Record<string, string>
  created_at: string
}

interface TestResult {
  id: string
  attempt_id: string
  question_id: string
  user_answer: string
  correct_answer: string
  is_correct: boolean
  created_at: string
  test_questions: {
    question_text: string
    options: Record<string, string> | null
    explanation: string | null
    difficulty_level: string
    question_type: string
  }
}

interface Course {
  id: string
  title: string
  instructor: string
}

async function getTestAttempt(attemptId: string, userId: string): Promise<TestAttempt | null> {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: attempt, error } = await supabase
    .from('test_attempts')
    .select('*')
    .eq('id', attemptId)
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching test attempt:', error)
    return null
  }

  return attempt
}

async function getTestResults(attemptId: string): Promise<TestResult[]> {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: results, error } = await supabase
    .from('test_results')
    .select(`
      *,
      test_questions (
        question_text,
        options,
        explanation,
        difficulty_level,
        question_type
      )
    `)
    .eq('attempt_id', attemptId)

  if (error) {
    console.error('Error fetching test results:', error)
    return []
  }

  return results || []
}

async function getCourseInfo(courseId: string): Promise<Course | null> {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: course, error } = await supabase
    .from('courses')
    .select('id, title, instructor')
    .eq('id', courseId)
    .single()

  if (error) {
    console.error('Error fetching course info:', error)
    return null
  }

  return course
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  } else {
    return `${remainingSeconds}s`
  }
}

function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 text-green-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'hard':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getGrade(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

export default async function TestResultsPage({ params }: TestResultsPageProps) {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const attempt = await getTestAttempt(params.attemptId, user.id)
  
  if (!attempt) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Test Results Not Found</h1>
          <p className="text-gray-600 mb-4">
            The test results you're looking for don't exist or you don't have permission to view them.
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

  const course = await getCourseInfo(params.courseId)
  const results = await getTestResults(params.attemptId)

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <p className="text-gray-600">The course associated with this test no longer exists.</p>
        </div>
      </div>
    )
  }

  const difficultyStats = results.reduce((stats, result) => {
    const difficulty = result.test_questions.difficulty_level
    if (!stats[difficulty]) {
      stats[difficulty] = { total: 0, correct: 0 }
    }
    stats[difficulty].total++
    if (result.is_correct) {
      stats[difficulty].correct++
    }
    return stats
  }, {} as Record<string, { total: number; correct: number }>)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Test Results</h1>
            <a 
              href={`/courses/${params.courseId}`}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Return to Course
            </a>
          </div>
          <div className="text-gray-600">
            <p className="text-lg">{course.title}</p>
            <p className="text-sm">Instructor: {course.instructor}</p>
          </div>
        </div>

        {/* Score Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {attempt.passed ? (
                <>
                  <CheckCircle className="text-green-500" />
                  Test Passed!
                </>
              ) : (
                <>
                  <XCircle className="text-red-500" />
                  Test Failed
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{attempt.score}%</div>
                <div className="text-sm text-gray-600">Score</div>
                <Badge className="mt-1">{getGrade(attempt.score)}</Badge>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">
                  {attempt.correct_answers}/{attempt.total_questions}
                </div>
                <div className="text-sm text-gray-600">Correct Answers</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">
                  {formatDuration(attempt.time_taken)}
                </div>
                <div className="text-sm text-gray-600">Time Taken</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">{attempt.passing_score}%</div>
                <div className="text-sm text-gray-600">Passing Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance by Difficulty */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Performance by Difficulty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(difficultyStats).map(([difficulty, stats]) => (
                <div key={difficulty} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getDifficultyColor(difficulty)}>
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {stats.correct}/{stats.total} questions
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      {Math.round((stats.correct / stats.total) * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Question-by-Question Results */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {results.map((result, index) => (
                <div key={result.id} className="border-l-4 border-gray-200 pl-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">
                        Question {index + 1}
                      </span>
                      <Badge className={getDifficultyColor(result.test_questions.difficulty_level)}>
                        {result.test_questions.difficulty_level}
                      </Badge>
                      {result.is_correct ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-gray-800 font-medium">
                      {result.test_questions.question_text}
                    </p>
                  </div>

                  {result.test_questions.question_type === 'multiple_choice' &&
                    result.test_questions.options && (
                      <div className="mb-3">
                        <div className="space-y-2">
                          {Object.entries(result.test_questions.options).map(([key, value]) => (
                            <div 
                              key={key}
                              className={`p-2 rounded border ${
                                key === result.correct_answer
                                  ? 'bg-green-50 border-green-200'
                                  : key === result.user_answer && !result.is_correct
                                  ? 'bg-red-50 border-red-200'
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{key}.</span>
                                <span>{value}</span>
                                {key === result.correct_answer && (
                                  <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                                )}
                                {key === result.user_answer && !result.is_correct && (
                                  <XCircle className="w-4 h-4 text-red-500 ml-auto" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {result.test_questions.question_type === 'true_false' && (
                    <div className="mb-3">
                      <div className="space-y-2">
                        <div 
                          className={`p-2 rounded border ${
                            result.correct_answer === 'true'
                              ? 'bg-green-50 border-green-200'
                              : result.user_answer === 'true' && !result.is_correct
                              ? 'bg-red-50 border-red-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">True</span>
                            {result.correct_answer === 'true' && (
                              <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                            )}
                            {result.user_answer === 'true' && !result.is_correct && (
                              <XCircle className="w-4 h-4 text-red-500 ml-auto" />
                            )}
                          </div>
                        </div>
                        <div 
                          className={`p-2 rounded border ${
                            result.correct_answer === 'false'
                              ? 'bg-green-50 border-green-200'
                              : result.user_answer === 'false' && !result.is_correct
                              ? 'bg-red-50 border-red-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">False</span>
                            {result.correct_answer === 'false' && (
                              <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                            )}
                            {result.user_answer === 'false' && !result.is_correct && (
                              <XCircle className="w-4 h-4 text-red-500 ml-auto" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {result.test_questions.question_type === 'short_answer' && (
                    <div className="mb-3">
                      <div className="space-y-2">
                        <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                          <div className="text-sm font-medium text-blue-800 mb-1">Your Answer:</div>
                          <div className="text-gray-800">{result.user_answer || 'No answer provided'}</div>
                        </div>
                        <div className="p-2 bg-green-50 border border-green-200 rounded">
                          <div className="text-sm font-medium text-green-800 mb-1">Correct Answer:</div>
                          <div className="text-gray-800">{result.correct_answer}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <span>Your answer:</span>
                    <span className="font-medium">{result.user_answer || 'Not answered'}</span>
                    {!result.is_correct && (
                      <>
                        <span className="mx-2">•</span>
                        <span>Correct answer:</span>
                        <span className="font-medium text-green-600">{result.correct_answer}</span>
                      </>
                    )}
                  </div>

                  {result.test_questions.explanation && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                      <div className="text-sm font-medium text-blue-800 mb-1">Explanation:</div>
                      <div className="text-sm text-gray-700">{result.test_questions.explanation}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test Completion Details */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Test Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Started:</span>{' '}
                {new Date(attempt.started_at).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Completed:</span>{' '}
                {new Date(attempt.completed_at).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Duration:</span>{' '}
                {formatDuration(attempt.time_taken)}
              </div>
              <div>
                <span className="font-medium">Attempt ID:</span>{' '}
                {attempt.id}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}