// lib/test-utils.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface TestQuestion {
  id: string
  question_text: string
  question_type: 'multiple_choice' | 'true_false' | 'short_answer'
  options: Record<string, string> | null
  correct_answer: string
  explanation: string | null
  difficulty_level: 'easy' | 'medium' | 'hard'
  order_index: number
}

export interface TestAttempt {
  id: string
  user_id: string
  course_id: string
  score: number
  total_questions: number
  correct_answers: number
  passing_score: number
  passed: boolean
  started_at: string
  completed_at: string | null
  time_taken: number | null
  answers: Record<string, string>
  created_at: string
}

export interface TestResult {
  id: string
  attempt_id: string
  question_id: string
  user_answer: string
  correct_answer: string
  is_correct: boolean
  created_at: string
}

export class TestService {
  private supabase = createClientComponentClient()

  // Get test questions for a course
  async getTestQuestions(courseId: string): Promise<TestQuestion[]> {
    const { data, error } = await this.supabase
      .from('test_questions')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching test questions:', error)
      throw new Error('Failed to fetch test questions')
    }

    return data || []
  }

  // Submit test answers
  async submitTest(
    courseId: string,
    userId: string,
    answers: Record<string, string>,
    timeTaken: number
  ): Promise<any> {
    const response = await fetch('/api/test/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courseId,
        userId,
        answers,
        timeTaken,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to submit test')
    }

    return response.json()
  }

  // Get user's test attempts for a course
  async getUserTestAttempts(courseId: string): Promise<TestAttempt[]> {
    const { data, error } = await this.supabase
      .from('test_attempts')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching test attempts:', error)
      throw new Error('Failed to fetch test attempts')
    }

    return data || []
  }

  // Get detailed test results for an attempt
  async getTestResults(attemptId: string): Promise<TestResult[]> {
    const { data, error } = await this.supabase
      .from('test_results')
      .select(`
        *,
        test_questions (
          question_text,
          options,
          explanation,
          difficulty_level
        )
      `)
      .eq('attempt_id', attemptId)

    if (error) {
      console.error('Error fetching test results:', error)
      throw new Error('Failed to fetch test results')
    }

    return data || []
  }

  // Check if user has passed the test
  async hasPassedTest(courseId: string, userId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('test_attempts')
      .select('passed')
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .eq('passed', true)
      .single()

    return !error && !!data
  }

  // Get course completion percentage
  async getCourseProgress(courseId: string, userId: string): Promise<{
    videoCompleted: boolean
    testPassed: boolean
    overallProgress: number
  }> {
    // Check video completion
    const { data: videoProgress, error: videoError } = await this.supabase
      .from('video_progress')
      .select('completed')
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .single()

    const videoCompleted = !videoError && videoProgress?.completed

    // Check test completion
    const testPassed = await this.hasPassedTest(courseId, userId)

    // Calculate overall progress
    let overallProgress = 0
    if (videoCompleted) overallProgress += 50
    if (testPassed) overallProgress += 50

    return {
      videoCompleted,
      testPassed,
      overallProgress,
    }
  }

  // Calculate test statistics
  calculateTestStats(attempts: TestAttempt[]): {
    totalAttempts: number
    passedAttempts: number
    averageScore: number
    bestScore: number
    passRate: number
  } {
    const totalAttempts = attempts.length
    const passedAttempts = attempts.filter(attempt => attempt.passed).length
    const averageScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts
    const bestScore = Math.max(...attempts.map(attempt => attempt.score))
    const passRate = (passedAttempts / totalAttempts) * 100

    return {
      totalAttempts,
      passedAttempts,
      averageScore: Math.round(averageScore * 100) / 100,
      bestScore,
      passRate: Math.round(passRate * 100) / 100,
    }
  }

  // Validate test answers
  validateAnswers(questions: TestQuestion[], answers: Record<string, string>): {
    isValid: boolean
    missingAnswers: string[]
    invalidAnswers: string[]
  } {
    const missingAnswers: string[] = []
    const invalidAnswers: string[] = []

    questions.forEach(question => {
      const answer = answers[question.id]
      
      if (!answer) {
        missingAnswers.push(question.id)
        return
      }

      // Validate answer format based on question type
      if (question.question_type === 'multiple_choice' && question.options) {
        if (!Object.keys(question.options).includes(answer)) {
          invalidAnswers.push(question.id)
        }
      } else if (question.question_type === 'true_false') {
        if (!['true', 'false'].includes(answer)) {
          invalidAnswers.push(question.id)
        }
      }
    })

    return {
      isValid: missingAnswers.length === 0 && invalidAnswers.length === 0,
      missingAnswers,
      invalidAnswers,
    }
  }

  // Format time duration
  formatDuration(seconds: number): string {
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

  // Get difficulty color
  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'hard':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  // Get grade based on score
  getGrade(score: number): string {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }
}

// Export a singleton instance
export const testService = new TestService()

// Helper functions for test validation
export const TEST_CONSTRAINTS = {
  MIN_QUESTIONS: 1,
  MAX_QUESTIONS: 100,
  MIN_TIME_LIMIT: 300, // 5 minutes
  MAX_TIME_LIMIT: 7200, // 2 hours
  DEFAULT_TIME_LIMIT: 1800, // 30 minutes
  DEFAULT_PASSING_SCORE: 70,
  MIN_PASSING_SCORE: 50,
  MAX_PASSING_SCORE: 100,
}

export function validateTestConfiguration(config: {
  timeLimit: number
  passingScore: number
  questionCount: number
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (config.timeLimit < TEST_CONSTRAINTS.MIN_TIME_LIMIT) {
    errors.push(`Time limit must be at least ${TEST_CONSTRAINTS.MIN_TIME_LIMIT} seconds`)
  }

  if (config.timeLimit > TEST_CONSTRAINTS.MAX_TIME_LIMIT) {
    errors.push(`Time limit cannot exceed ${TEST_CONSTRAINTS.MAX_TIME_LIMIT} seconds`)
  }

  if (config.passingScore < TEST_CONSTRAINTS.MIN_PASSING_SCORE) {
    errors.push(`Passing score must be at least ${TEST_CONSTRAINTS.MIN_PASSING_SCORE}%`)
  }

  if (config.passingScore > TEST_CONSTRAINTS.MAX_PASSING_SCORE) {
    errors.push(`Passing score cannot exceed ${TEST_CONSTRAINTS.MAX_PASSING_SCORE}%`)
  }

  if (config.questionCount < TEST_CONSTRAINTS.MIN_QUESTIONS) {
    errors.push(`Test must have at least ${TEST_CONSTRAINTS.MIN_QUESTIONS} question`)
  }

  if (config.questionCount > TEST_CONSTRAINTS.MAX_QUESTIONS) {
    errors.push(`Test cannot have more than ${TEST_CONSTRAINTS.MAX_QUESTIONS} questions`)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}