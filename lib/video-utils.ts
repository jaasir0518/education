// lib/video-utils.ts
export async function getVideoDuration(videoUrl: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    
    video.onloadedmetadata = () => {
      resolve(video.duration)
    }
    
    video.onerror = () => {
      reject(new Error('Failed to load video metadata'))
    }
    
    video.src = videoUrl
  })
}

export function formatVideoDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
}

// Server-side video duration extraction (for when uploading videos)
export async function getVideoDurationServer(videoFile: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    
    video.onloadedmetadata = () => {
      resolve(video.duration)
    }
    
    video.onerror = () => {
      reject(new Error('Failed to load video metadata'))
    }
    
    video.src = URL.createObjectURL(videoFile)
  })
}

// API endpoint to update video duration in database
// app/api/courses/[courseId]/update-duration/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { videoDuration } = await request.json()
    
    const supabase = createServerComponentClient({ cookies })
    
    // Verify user is authenticated and authorized
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update course with video duration
    const { data, error } = await supabase
      .from('courses')
      .update({ video_duration: Math.floor(videoDuration) })
      .eq('id', params.courseId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to update course' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error updating video duration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Client-side hook to automatically get and update video duration
// hooks/useVideoDuration.ts
import { useEffect, useState } from 'react'

export function useVideoDuration(videoUrl: string, courseId: string) {
  const [duration, setDuration] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!videoUrl) return

    const getDuration = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const video = document.createElement('video')
        video.preload = 'metadata'
        
        const durationPromise = new Promise<number>((resolve, reject) => {
          video.onloadedmetadata = () => resolve(video.duration)
          video.onerror = () => reject(new Error('Failed to load video'))
        })
        
        video.src = videoUrl
        const videoDuration = await durationPromise
        
        setDuration(videoDuration)
        
        // Update database with duration
        await fetch(`/api/courses/${courseId}/update-duration`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ videoDuration }),
        })
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    getDuration()
  }, [videoUrl, courseId])

  return { duration, isLoading, error }
}