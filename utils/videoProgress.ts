// utils/videoProgress.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'

export async function saveVideoProgress(videoId: string, progress: number, duration?: number) {
  try {
    // Validate inputs first
    if (!videoId || typeof videoId !== 'string') {
      console.error('Invalid video ID:', videoId)
      return { error: 'Invalid video ID' }
    }

    if (typeof progress !== 'number' || progress < 0) {
      console.error('Invalid progress value:', progress)
      return { error: 'Invalid progress value' }
    }

    console.log('Saving video progress via API:', { videoId, progress, duration })
    
    const response = await fetch(`/api/videos/${videoId}/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        progress: progress,
        duration: duration
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('API error response:', errorData)
      return { error: errorData.error || 'Failed to save progress' }
    }

    const data = await response.json()
    console.log('Video progress saved successfully:', data)
    return { success: true, data }

  } catch (error) {
    console.error('Error saving video progress:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      errorType: typeof error,
      errorString: String(error),
      error: error
    })
    return { 
      error: error instanceof Error ? error.message : 'Unexpected error occurred',
      details: error instanceof Error ? error.stack : String(error)
    }
  }
}

// Client-side usage example
export function useVideoProgress(videoId: string) {
    const [progress, setProgress] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    const saveProgress = async (currentTime: number, duration?: number) => {
        if (!videoId || isLoading) return

        setIsLoading(true)
        
        try {
            console.log('Saving progress:', { videoId, currentTime, duration })
            
            const result = await saveVideoProgress(videoId, currentTime, duration)
            
            if (result.error) {
                throw new Error(result.error)
            }

            const progressPercent = duration ? (currentTime / duration) * 100 : currentTime
            setProgress(progressPercent)
            
        } catch (error) {
            console.error('Error saving video progress:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                errorType: typeof error,
                errorString: String(error),
                error: error
            })
            // Don't throw here, just log - progress saving shouldn't break video playback
        } finally {
            setIsLoading(false)
        }
    }

    return { progress, saveProgress, isLoading }
}

// Helper function to get video progress
export async function getVideoProgress(videoId: string) {
    try {
        const supabase = createClientComponentClient()
        
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { error: 'User not authenticated' }
        }

        const { data, error } = await supabase
            .from('video_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('video_id', videoId)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                // No progress found, return 0
                return { progress: 0, last_position: 0 }
            }
            console.error('Error fetching video progress:', error)
            return { error: 'Failed to fetch progress' }
        }

        return data
    } catch (error) {
        console.error('Error fetching video progress:', error)
        return { error: 'Unexpected error occurred' }
    }
}