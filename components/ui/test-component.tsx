import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

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
}

interface TestComponentProps {
  course: Course
  questions: TestQuestion[]
  userId: string
}

interface TestResult {
  questionId: string
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
  explanation: string | null
}

export function TestComponent({ course, questions, userId }: TestComponentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(30 * 60) // 30 minutes in seconds
  const [testStarted, setTestStarted] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [score, setScore] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100

  // Timer effect
  useEffect(() => {
    if (!testStarted || testCompleted) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmitTest()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [testStarted, testCompleted])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartTest = () => {
    setTestStarted(true)
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmitTest = async () => {
    setIsSubmitting(true)
    
    try {
      // Calculate results
      const results: TestResult[] = questions.map(question => ({
        questionId: question.id,
        userAnswer: answers[question.id] || '',
        correctAnswer: question.correct_answer,
        isCorrect: answers[question.id] === question.correct_answer,
        explanation: question.explanation
      }))

      const correctCount = results.filter(r => r.isCorrect).length
      const scorePercentage = (correctCount / totalQuestions) * 100
      const passed = scorePercentage >= 70

      // Submit to database
      const response = await fetch('/api/test/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course.id,
          userId,
          answers,
          score: scorePercentage,
          totalQuestions,
          correctAnswers: correctCount,
          passed,
          timeLeft
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit test')
      }

      setTestResults(results)
      setScore(scorePercentage)
      setTestCompleted(true)
    } catch (error) {
      console.error('Error submitting test:', error)
      // Handle error appropriately
    } finally {
      setIsSubmitting(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderQuestion = (question: TestQuestion) => {
    const userAnswer = answers[question.id]

    if (question.question_type === 'multiple_choice') {
      return (
        <div className="space-y-3">
          {question.options && Object.entries(question.options).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-3">
              <input
                type="radio"
                id={`${question.id}-${key}`}
                name={question.id}
                value={key}
                checked={userAnswer === key}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <label 
                htmlFor={`${question.id}-${key}`}
                className="flex-1 cursor-pointer p-3 rounded-lg border hover:bg-gray-50"
              >
                <span className="font-medium">{key.toUpperCase()}.</span> {value}
              </label>
            </div>
          ))}
        </div>
      )
    }

    if (question.question_type === 'true_false') {
      return (
        <div className="space-y-3">
          {['true', 'false'].map(option => (
            <div key={option} className="flex items-center space-x-3">
              <input
                type="radio"
                id={`${question.id}-${option}`}
                name={question.id}
                value={option}
                checked={userAnswer === option}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <label 
                htmlFor={`${question.id}-${option}`}
                className="flex-1 cursor-pointer p-3 rounded-lg border hover:bg-gray-50"
              >
                {option === 'true' ? 'True' : 'False'}
              </label>
            </div>
          ))}
        </div>
      )
    }

    return (
      <textarea
        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        rows={4}
        placeholder="Type your answer here..."
        value={userAnswer || ''}
        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
      />
    )
  }

  if (testCompleted) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Test Completed!</CardTitle>
            <div className="flex justify-center mt-4">
              {score >= 70 ? (
                <CheckCircle className="w-16 h-16 text-green-500" />
              ) : (
                <XCircle className="w-16 h-16 text-red-500" />
              )}
            </div>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-4xl font-bold">
              {score.toFixed(1)}%
            </div>
            <div className="text-lg">
              {testResults.filter(r => r.isCorrect).length} out of {totalQuestions} correct
            </div>
            <Badge 
              variant={score >= 70 ? "default" : "destructive"} 
              className={score >= 70 ? "bg-green-500" : "bg-red-500"}
            >
              {score >= 70 ? "PASSED" : "FAILED"}
            </Badge>
            {score >= 70 && (
              <div className="mt-4">
                <p className="text-green-600 font-medium">
                  Congratulations! You can now generate your certificate.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review Your Answers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((result, index) => {
                const question = questions[index]
                return (
                  <div key={result.questionId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Question {index + 1}</span>
                      <div className="flex items-center space-x-2">
                        <Badge className={getDifficultyColor(question.difficulty_level)}>
                          {question.difficulty_level}
                        </Badge>
                        {result.isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    </div>
                    <p className="mb-3">{question.question_text}</p>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Your Answer: </span>
                        <span className={result.isCorrect ? 'text-green-600' : 'text-red-600'}>
                          {result.userAnswer || 'No answer'}
                        </span>
                      </div>
                      {!result.isCorrect && (
                        <div>
                          <span className="font-medium">Correct Answer: </span>
                          <span className="text-green-600">{result.correctAnswer}</span>
                        </div>
                      )}
                      {result.explanation && (
                        <div className="mt-2 p-2 bg-blue-50 rounded">
                          <span className="font-medium">Explanation: </span>
                          {result.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button onClick={() => window.location.href = `/courses/${course.id}`}>
            Back to Course
          </Button>
        </div>
      </div>
    )
  }

  if (!testStarted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Course Certification Test</CardTitle>
          <p className="text-gray-600">{course.title}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Test Instructions:</strong>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>This test contains {totalQuestions} questions</li>
                <li>You have 30 minutes to complete the test</li>
                <li>You need to score at least 70% to pass</li>
                <li>You can navigate between questions before submitting</li>
                <li>Once submitted, you cannot retake the test</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalQuestions}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">30</div>
              <div className="text-sm text-gray-600">Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">70%</div>
              <div className="text-sm text-gray-600">Passing Score</div>
            </div>
          </div>

          <Button 
            onClick={handleStartTest}
            className="w-full"
            size="lg"
          >
            Start Test
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Certification Test</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span className="font-mono">{formatTime(timeLeft)}</span>
          </div>
          <Badge variant="outline">
            {currentQuestionIndex + 1} of {totalQuestions}
          </Badge>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">
              Question {currentQuestionIndex + 1}
            </CardTitle>
            <Badge className={getDifficultyColor(currentQuestion.difficulty_level)}>
              {currentQuestion.difficulty_level}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg">{currentQuestion.question_text}</p>
          {renderQuestion(currentQuestion)}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        
        <div className="flex space-x-2">
          {currentQuestionIndex === totalQuestions - 1 ? (
            <Button 
              onClick={handleSubmitTest}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Test'}
            </Button>
          ) : (
            <Button onClick={handleNextQuestion}>
              Next
            </Button>
          )}
        </div>
      </div>

      {/* Question Navigator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Question Navigator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`p-2 rounded text-sm font-medium ${
                  index === currentQuestionIndex
                    ? 'bg-blue-500 text-white'
                    : answers[questions[index].id]
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}