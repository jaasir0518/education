// app/api/test/submit/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId, userId, answers, timeTaken } = await request.json()

    // Validate that the user making the request is the same as the userId
    if (user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch test questions for the course
    const { data: questions, error: questionsError } = await supabase
      .from('test_questions')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true })

    if (questionsError) {
      console.error('Error fetching questions:', questionsError)
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json({ error: 'No questions found for this course' }, { status: 404 })
    }

    // Calculate score
    let correctAnswers = 0
    const totalQuestions = questions.length

    // Prepare test results data
    const testResults = questions.map((question) => {
      const userAnswer = answers[question.id] || ''
      const isCorrect = userAnswer === question.correct_answer
      
      if (isCorrect) {
        correctAnswers++
      }

      return {
        question_id: question.id,
        user_answer: userAnswer,
        correct_answer: question.correct_answer,
        is_correct: isCorrect
      }
    })

    const score = Math.round((correctAnswers / totalQuestions) * 100)
    const passingScore = 70
    const passed = score >= passingScore

    // Start a transaction to insert test attempt and results
    const { data: testAttempt, error: attemptError } = await supabase
      .from('test_attempts')
      .insert({
        user_id: userId,
        course_id: courseId,
        score: score,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        passing_score: passingScore,
        passed: passed,
        completed_at: new Date().toISOString(),
        time_taken: timeTaken,
        answers: answers
      })
      .select()
      .single()

    if (attemptError) {
      console.error('Error creating test attempt:', attemptError)
      return NextResponse.json({ error: 'Failed to create test attempt' }, { status: 500 })
    }

    // Insert detailed test results
    const resultsWithAttemptId = testResults.map(result => ({
      ...result,
      attempt_id: testAttempt.id
    }))

    const { error: resultsError } = await supabase
      .from('test_results')
      .insert(resultsWithAttemptId)

    if (resultsError) {
      console.error('Error creating test results:', resultsError)
      return NextResponse.json({ error: 'Failed to create test results' }, { status: 500 })
    }

    // If test passed, update course completion status
    if (passed) {
      // You might want to update a course_completions table or similar
      // For now, we'll just return the success response
    }

    return NextResponse.json({
      success: true,
      score: score,
      total_questions: totalQuestions,
      correct_answers: correctAnswers,
      passed: passed,
      time_taken: timeTaken,
      attempt_id: testAttempt.id
    })

  } catch (error) {
    console.error('Error submitting test:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Optional: GET endpoint to fetch test results
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const attemptId = searchParams.get('attemptId')

    if (attemptId) {
      // Get specific attempt with detailed results
      const { data: attempt, error: attemptError } = await supabase
        .from('test_attempts')
        .select(`
          *,
          test_results (
            *,
            test_questions (
              question_text,
              options,
              explanation
            )
          )
        `)
        .eq('id', attemptId)
        .eq('user_id', user.id)
        .single()

      if (attemptError) {
        return NextResponse.json({ error: 'Test attempt not found' }, { status: 404 })
      }

      return NextResponse.json(attempt)
    }

    if (courseId) {
      // Get all attempts for a course
      const { data: attempts, error: attemptsError } = await supabase
        .from('test_attempts')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (attemptsError) {
        return NextResponse.json({ error: 'Failed to fetch attempts' }, { status: 500 })
      }

      return NextResponse.json(attempts)
    }

    return NextResponse.json({ error: 'courseId or attemptId required' }, { status: 400 })

  } catch (error) {
    console.error('Error fetching test results:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}