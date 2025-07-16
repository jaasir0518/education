'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Clock, Award } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

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

interface TestInterfaceProps {
  questions: TestQuestion[]
  courseId: string
  userId: string
  courseTitle: string
}

interface UserAnswer {
  questionId: string
  selectedAnswer: string
  isCorrect: boolean
}

export function TestInterface({ questions, courseId, userId, courseTitle }: TestInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)
  const [testResults, setTestResults] = useState<{
    score: number
    correctAnswers: number
    totalQuestions: number
    passed: boolean
    timeTaken: number
  } | null>(null)
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [showResults, setShowResults] = useState(false)
  const [detailedResults, setDetailedResults] = useState<UserAnswer[]>([])
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    setStartTime(Date.now())
  }, [])

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  const handleAnswerChange = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const calculateResults = () => {
    const results: UserAnswer[] = []
    let correctCount = 0

    questions.forEach(question => {
      const userAnswer = userAnswers[question.id]
      const isCorrect = userAnswer === question.correct_answer
      
      if (isCorrect) {
        correctCount++
      }

      results.push({
        questionId: question.id,
        selectedAnswer: userAnswer,
        isCorrect
      })
    })

    const score = Math.round((correctCount / questions.length) * 100)
    const passed = score >= 70
    const timeTaken = Math.round((Date.now() - startTime) / 1000)

    return {
      score,
      correctAnswers: correctCount,
      totalQuestions: questions.length,
      passed,
      timeTaken,
      detailedResults: results
    }
  }

  const submitTest = async () => {
    setIsSubmitting(true)
    
    try {
      const results = calculateResults()
      
      // Save test attempt to database
      const { data: testAttempt, error } = await supabase
        .from('test_attempts')
        .insert({
          user_id: userId,
          course_id: courseId,
          score: results.score,
          total_questions: results.totalQuestions,
          correct_answers: results.correctAnswers,
          passing_score: 70,
          passed: results.passed,
          time_taken: results.timeTaken,
          answers: userAnswers
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      setTestResults(results)
      setDetailedResults(results.detailedResults)
      setTestCompleted(true)
      
    } catch (error) {
      console.error('Error submitting test:', error)
      alert('Failed to submit test. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canSubmit = () => {
    return questions.every(question => userAnswers[question.id])
  }

  const goToCourse = () => {
    router.push(`/courses/${courseId}`)
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  // Test completion screen
  if (testCompleted && testResults) {
    return (
      <div className="space-y-6">
        {/* Results Summary */}
        <Card className={`border-2 ${testResults.passed ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {testResults.passed ? (
                <CheckCircle className="w-16 h-16 text-green-500" />
              ) : (
                <XCircle className="w-16 h-16 text-red-500" />
              )}
            </div>
            <CardTitle className={`text-2xl ${testResults.passed ? 'text-green-700' : 'text-red-700'}`}>
              {testResults.passed ? 'Congratulations! You Passed!' : 'Test Not Passed'}
            </CardTitle>
            <CardDescription className={testResults.passed ? 'text-green-600' : 'text-red-600'}>
              {testResults.passed 
                ? 'You have successfully completed the test. You can now generate your certificate!'
                : 'You need at least 70% to pass. You can retake the test anytime.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{testResults.score}%</p>
                <p className="text-sm text-gray-600">Score</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {testResults.correctAnswers}/{testResults.totalQuestions}
                </p>
                <p className="text-sm text-gray-600">Correct</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatTime(testResults.timeTaken)}</p>
                <p className="text-sm text-gray-600">Time</p>
              </div>
              <div>
                <p className={`text-2xl font-bold ${testResults.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {testResults.passed ? 'PASS' : 'FAIL'}
                </p>
                <p className="text-sm text-gray-600">Status</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button 
            onClick={goToCourse}
            className="bg-blue-500 hover:bg-blue-600"
            size="lg"
          >
            {testResults.passed ? '🏆 Go to Course & Generate Certificate' : '← Back to Course'}
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => setShowResults(!showResults)}
            size="lg"
          >
            {showResults ? 'Hide Results' : 'View Detailed Results'}
          </Button>
          
          {!testResults.passed && (
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
              size="lg"
            >
              🔄 Retake Test
            </Button>
          )}
        </div>

        {/* Detailed Results */}
        {showResults && (
          <Card>
            <CardHeader>
              <CardTitle>Detailed Results</CardTitle>
              <CardDescription>Review your answers and explanations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {questions.map((question, index) => {
                  const userAnswer = detailedResults.find(r => r.questionId === question.id)
                  const isCorrect = userAnswer?.isCorrect || false
                  
                  return (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <Badge variant={isCorrect ? "default" : "destructive"} className="mt-1">
                          {index + 1}
                        </Badge>
                        <div className="flex-1">
                          <h4 className="font-medium mb-2">{question.question_text}</h4>
                          <div className="space-y-2 text-sm">
                            {question.options.map((option: string, optIndex: number) => (
                              <div 
                                key={optIndex} 
                                className={`p-2 rounded ${
                                  option === question.correct_answer 
                                    ? 'bg-green-100 border border-green-300' 
                                    : option === userAnswer?.selectedAnswer && !isCorrect
                                    ? 'bg-red-100 border border-red-300'
                                    : 'bg-gray-50'
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  {option === question.correct_answer && (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  )}
                                  {option === userAnswer?.selectedAnswer && !isCorrect && (
                                    <XCircle className="w-4 h-4 text-red-500" />
                                  )}
                                  {option}
                                </span>
                              </div>
                            ))}
                          </div>
                          {question.explanation && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm text-blue-800">
                                <strong>Explanation:</strong> {question.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // Test interface
  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-gray-600">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="mb-2">
              Question {currentQuestionIndex + 1}
            </Badge>
            <Badge variant="secondary">
              {currentQuestion.difficulty_level}
            </Badge>
          </div>
          <CardTitle className="text-lg">{currentQuestion.question_text}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={userAnswers[currentQuestion.id] || ''}
            onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
          >
            {currentQuestion.options.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={previousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          ← Previous
        </Button>

        <div className="flex gap-2">
          {questions.map((_, index) => (
            <Button
              key={index}
              variant={index === currentQuestionIndex ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-8 h-8 p-0 ${
                userAnswers[questions[index].id] ? 'bg-green-100' : ''
              }`}
            >
              {index + 1}
            </Button>
          ))}
        </div>

        {currentQuestionIndex < questions.length - 1 ? (
          <Button 
            onClick={nextQuestion}
            disabled={!userAnswers[currentQuestion.id]}
          >
            Next →
          </Button>
        ) : (
          <Button 
            onClick={submitTest}
            disabled={!canSubmit() || isSubmitting}
            className="bg-green-500 hover:bg-green-600"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Test'}
          </Button>
        )}
      </div>

      {/* Answer Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Answer Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                  userAnswers[question.id]
                    ? 'bg-green-100 border-green-300 text-green-700'
                    : 'bg-gray-100 border-gray-300 text-gray-500'
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Answered: {Object.keys(userAnswers).length} / {questions.length}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}