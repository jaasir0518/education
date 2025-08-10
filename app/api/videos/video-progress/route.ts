// app/api/video-progress/route.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies })
    
    // Get the authenticated user
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

    // Parse the request body
    const body = await request.json()
    const {
      course_id,
      current_time,
      duration,
      watch_percentage,
      completed
    } = body

    // Validate required fields
    if (!course_id || current_time === undefined || duration === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: course_id, current_time, duration' },
        { status: 400 }
      )
    }

    // Calculate watch percentage if not provided
    const calculatedWatchPercentage = watch_percentage !== undefined 
      ? watch_percentage 
      : duration > 0 ? (current_time / duration) * 100 : 0

    // Determine if video is completed (90% threshold)
    const isCompleted = completed !== undefined 
      ? completed 
      : calculatedWatchPercentage >= 90

    // Upsert video progress
    const { data, error } = await supabase
      .from('video_progress')
      .upsert(
        {
          user_id: user.id,
          course_id,
          current_time,
          duration,
          watch_percentage: calculatedWatchPercentage,
          completed: isCompleted,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,course_id',
          ignoreDuplicates: false,
        }
      )
      .select()
      .single()

    if (error) {
      console.error('Error saving video progress:', error)
      return NextResponse.json(
        { error: 'Failed to save video progress' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Video progress saved successfully'
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies })
    
    // Get the authenticated user
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

    // Get course_id from query parameters
    const { searchParams } = new URL(request.url)
    const course_id = searchParams.get('course_id')

    if (!course_id) {
      return NextResponse.json(
        { error: 'Missing course_id parameter' },
        { status: 400 }
      )
    }

    // Get video progress for the user and course
    const { data, error } = await supabase
      .from('video_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', course_id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching video progress:', error)
      return NextResponse.json(
        { error: 'Failed to fetch video progress' },
        { status: 500 }
      )
    }

      return NextResponse.json({
        success: true,
        data: data || null
      })
  
    } catch (error) {
      console.error('API Error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }