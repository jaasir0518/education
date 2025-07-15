import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

interface RequestBody {
    progress: number
    duration?: number
}

interface RouteParams {
    videoId: string
}

interface ProgressData {
    user_id: string
    video_id: string
    progress: number
    last_position: number
    updated_at: string
    duration?: number
}

interface RouteContext {
    params: RouteParams
}

export async function POST(request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
    try {
        const body: RequestBody = await request.json()
        const { progress, duration } = body
        
        // Validate the request body
        if (typeof progress !== 'number' || progress < 0) {
            return NextResponse.json({ error: 'Invalid progress value' }, { status: 400 })
        }

        console.log('API received:', { videoId: params.videoId, progress, duration })

        const supabase = createServerComponentClient({ cookies })

        const userId: string | null = await getUserIdFromSession(request) // Implement this based on your auth
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError) {
            console.error('Auth error:', authError.message, authError)
            return NextResponse.json({ error: `Authentication failed: ${authError.message}` }, { status: 401 })
        }
        
        if (!user) {
            console.error('No user found')
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
        }

        // Validate inputs
        if (!params.videoId || typeof params.videoId !== 'string') {
            console.error('Invalid video ID:', params.videoId)
            return NextResponse.json({ error: 'Invalid video ID' }, { status: 400 })
        }

        if (typeof progress !== 'number' || progress < 0) {
            console.error('Invalid progress value:', progress)
            return NextResponse.json({ error: 'Invalid progress value' }, { status: 400 })
        }

        // Calculate progress percentage if duration is provided
        const progressPercent: number = duration ? (progress / duration) * 100 : progress

        // Prepare the data to upsert
        const progressData: ProgressData = {
            user_id: user.id,
            video_id: params.videoId,
            progress: Math.min(Math.max(progressPercent, 0), 100), // Clamp between 0 and 100
            last_position: progress, // Store actual time position
            updated_at: new Date().toISOString(),
            ...(duration && typeof duration === 'number' && duration > 0 && { duration })
        }

        console.log('Attempting to save progress data:', progressData)

        // First, let's try to check if the video_progress table exists
        const { data: tableCheck, error: tableError } = await supabase
            .from('video_progress')
            .select('*')
            .limit(1)

        if (tableError) {
            console.error('Video progress table error:', {
                message: tableError.message,
                details: tableError.details,
                hint: tableError.hint,
                code: tableError.code
            })
            
            // If table doesn't exist, we'll create a simple log instead
            console.log('Video progress table not found, logging progress:', progressData)
            return NextResponse.json({ 
                success: true, 
                message: 'Progress logged (table not available)',
                data: progressData 
            })
        }

        // Upsert progress (insert or update)
        const { data, error } = await supabase
            .from('video_progress')
            .upsert({
                user_id: user.id,
                video_id: params.videoId,
                progress: progress,
                duration: duration,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,video_id' // Specify the conflict columns
            })
        
        if (error) {
            console.error('Database error saving video progress:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
                progressData: progressData
            })
            return NextResponse.json({ error: `Failed to save progress: ${error.message}` }, { status: 500 })
        }

        console.log('Video progress saved successfully:', data)
        return NextResponse.json({ success: true, data })

    } catch (error) {
        console.error('API error:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            errorType: typeof error,
            errorString: String(error),
            error: error
        })
        return NextResponse.json({ 
            error: error instanceof Error ? error.message : 'Failed to save progress',
            details: error instanceof Error ? error.stack : String(error)
        }, { status: 500 })
    }
}

async function getUserIdFromSession(request: NextRequest): Promise<string | null> {
    try {
        const supabase = createServerComponentClient({ cookies })
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
            return null
        }
        
        return user.id
    } catch (error) {
        console.error('Error getting user from session:', error)
        return null
    }
}

