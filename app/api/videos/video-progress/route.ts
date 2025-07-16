// app/api/video-progress/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const { courseId, userId, currentTime, duration, completed, watchPercentage } = await request.json()

    // Validate required fields
    if (!courseId || !userId || typeof currentTime !== 'number' || typeof duration !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Ensure user can only update their own progress
    if (userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Validate numeric values
    if (currentTime < 0 || duration <= 0 || watchPercentage < 0 || watchPercentage > 100) {
      return NextResponse.json(
        { error: 'Invalid progress values' },
        { status: 400 }
      )
    }

    // Check if user is enrolled in the course
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single()

    if (enrollmentError || !enrollment) {
      return NextResponse.json(
        { error: 'User not enrolled in course' },
        { status: 403 }
      )
    }

    // Update or create video progress record
    const { data: existingProgress, error: fetchError } = await supabase
      .from('video_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single()

    let progressData
    let progressError

    if (fetchError && fetchError.code === 'PGRST116') {
      // Record doesn't exist, create new one
      const { data, error } = await supabase
        .from('video_progress')
        .insert({
          user_id: userId,
          course_id: courseId,
          current_time: Math.floor(currentTime),
          duration: Math.floor(duration),
          completed: completed || false,
          watch_percentage: Math.min(Math.max(watchPercentage, 0), 100),
        })
        .select()
        .single()

      progressData = data
      progressError = error
    } else if (!fetchError) {
      // Record exists, update it
      const { data, error } = await supabase
        .from('video_progress')
        .update({
          current_time: Math.floor(currentTime),
          duration: Math.floor(duration),
          completed: completed || existingProgress.completed,
          watch_percentage: Math.min(Math.max(watchPercentage, 0), 100),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .select()
        .single()

      progressData = data
      progressError = error
    } else {
      // Error fetching existing progress
      return NextResponse.json(
        { error: 'Failed to fetch existing progress' },
        { status: 500 }
      )
    }

    if (progressError) {
      console.error('Error saving video progress:', progressError)
      return NextResponse.json(
        { error: 'Failed to save progress' },
        { status: 500 }
      )
    }

    // If video is marked as completed, also update the course's video_duration if needed
    if (completed && duration > 0) {
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('video_duration')
        .eq('id', courseId)
        .single()

      if (!courseError && course) {
        // Update course video_duration if it's not set or significantly different
        if (!course.video_duration || Math.abs(course.video_duration - duration) > 5) {
          await supabase
            .from('courses')
            .update({
              video_duration: Math.floor(duration),
              updated_at: new Date().toISOString(),
            })
            .eq('id', courseId)
        }
      }
    }

    return NextResponse.json({
      success: true,
      progress: progressData,
      message: 'Video progress saved successfully'
    })

  } catch (error) {
    console.error('Error in video progress API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const userId = searchParams.get('userId')

    if (!courseId || !userId) {
      return NextResponse.json(
        { error: 'Missing courseId or userId' },
        { status: 400 }
      )
    }

    // Ensure user can only access their own progress
    if (userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get video progress
    const { data: progress, error } = await supabase
      .from('video_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching video progress:', error)
      return NextResponse.json(
        { error: 'Failed to fetch progress' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      progress: progress || null
    })

  } catch (error) {
    console.error('Error in video progress GET API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}