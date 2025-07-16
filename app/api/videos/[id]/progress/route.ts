import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { progress, duration } = await request.json()

    // Validate required fields
    if (typeof progress !== 'number' || typeof duration !== 'number') {
      return NextResponse.json(
        { error: 'Invalid progress or duration values' },
        { status: 400 }
      )
    }

    // Validate inputs
    if (!params.id || typeof params.id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid video ID' },
        { status: 400 }
      )
    }

    if (progress < 0 || duration <= 0) {
      return NextResponse.json(
        { error: 'Invalid progress values' },
        { status: 400 }
      )
    }

    // Calculate progress percentage
    const progressPercent = Math.min(Math.max((progress / duration) * 100, 0), 100)

    // Prepare the data to upsert
    const progressData = {
      user_id: user.id,
      video_id: params.id,
      progress: progressPercent,
      last_position: progress,
      duration: duration,
      updated_at: new Date().toISOString()
    }

    console.log('Saving video progress:', progressData)

    // Upsert progress (insert or update)
    const { data, error } = await supabase
      .from('video_progress')
      .upsert(progressData, {
        onConflict: 'user_id,video_id'
      })
      .select()

    if (error) {
      console.error('Database error saving video progress:', error)
      return NextResponse.json(
        { error: `Failed to save progress: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data
    })

  } catch (error) {
    console.error('Error in video progress API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get video progress
    const { data: progress, error } = await supabase
      .from('video_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('video_id', params.id)
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
