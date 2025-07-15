// app/api/test/questions/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch test questions for a course
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

    if (!courseId) {
      return NextResponse.json({ error: 'courseId is required' }, { status: 400 })
    }

    // Check if user is enrolled in the course
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single()

    if (enrollmentError || !enrollment) {
      return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 })
    }

    // Fetch questions (without correct answers for security)
    const { data: questions, error: questionsError } = await supabase
      .from('test_questions')
      .select('id, question_text, question_type, options, difficulty_level, order_index')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true })

    if (questionsError) {
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
    }

    return NextResponse.json(questions)

  } catch (error) {
    console.error('Error fetching test questions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new test questions (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin/instructor (you'll need to implement this logic)
    // For now, we'll assume any authenticated user can create questions
    // In production, you should check user roles

    const { courseId, questions } = await request.json()

    if (!courseId || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    // Validate question format
    for (const question of questions) {
      if (!question.question_text || !question.question_type || !question.correct_answer) {
        return NextResponse.json({ error: 'Invalid question format' }, { status: 400 })
      }
      
      if (question.question_type === 'multiple_choice' && !question.options) {
        return NextResponse.json({ error: 'Multiple choice questions require options' }, { status: 400 })
      }
    }

    // Insert questions
    const questionsToInsert = questions.map((question, index) => ({
      course_id: courseId,
      question_text: question.question_text,
      question_type: question.question_type,
      options: question.options || null,
      correct_answer: question.correct_answer,
      explanation: question.explanation || null,
      difficulty_level: question.difficulty_level || 'medium',
      order_index: question.order_index || index + 1
    }))

    const { data: insertedQuestions, error: insertError } = await supabase
      .from('test_questions')
      .insert(questionsToInsert)
      .select()

    if (insertError) {
      return NextResponse.json({ error: 'Failed to create questions' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      questions: insertedQuestions,
      count: insertedQuestions.length 
    })

  } catch (error) {
    console.error('Error creating test questions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update existing test questions (admin only)
export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { questionId, updates } = await request.json()

    if (!questionId || !updates) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    // Update question
    const { data: updatedQuestion, error: updateError } = await supabase
      .from('test_questions')
      .update(updates)
      .eq('id', questionId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update question' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      question: updatedQuestion 
    })

  } catch (error) {
    console.error('Error updating test question:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete test questions (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const questionId = searchParams.get('questionId')

    if (!questionId) {
      return NextResponse.json({ error: 'questionId is required' }, { status: 400 })
    }

    // Delete question
    const { error: deleteError } = await supabase
      .from('test_questions')
      .delete()
      .eq('id', questionId)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting test question:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}