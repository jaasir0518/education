'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

interface VideoProgress {
  id: string
  user_id: string
  course_id: string
  current_time: number
  duration: number
  completed: boolean
  watch_percentage: number
  created_at: string
  updated_at: string
}

interface VideoPlayerProps {
  videoUrl: string
  thumbnailUrl?: string | null
  title: string
  enrolled: boolean
  courseId: string
  userId: string
  initialProgress?: VideoProgress | null
}

export function VideoPlayer({
  videoUrl,
  thumbnailUrl,
  title,
  enrolled,
  courseId,
  userId,
  initialProgress
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(initialProgress?.current_time || 0)
  const [duration, setDuration] = useState(initialProgress?.duration || 0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [watchPercentage, setWatchPercentage] = useState(initialProgress?.watch_percentage || 0)
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Debounced save function
  const saveVideoProgress = useCallback(async (
    currentTime: number,
    videoDuration: number,
    watchPercentage: number,
    completed: boolean = false
  ) => {
    if (!enrolled) return

    try {
      const response = await fetch(`/api/videos/${courseId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          progress: currentTime,
          duration: videoDuration
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }))
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to save progress`)
      }

      const result = await response.json()
      console.log('Video progress saved:', result)
    } catch (error) {
      console.error('Error saving video progress:', error)
      // Don't throw the error to prevent disrupting video playback
      // The progress will be saved on the next successful attempt
    }
  }, [enrolled, courseId])

  // Debounce the save function
  const debouncedSave = useCallback(
    debounce((currentTime: number, duration: number, watchPercentage: number, completed: boolean = false) => {
      saveVideoProgress(currentTime, duration, watchPercentage, completed)
    }, 2000),
    [saveVideoProgress]
  )

  // Format time helper
  const formatTime = (time: number): string => {
    if (!time || !isFinite(time)) return '0:00'
    
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }
  }

  // Video event handlers
  const handleLoadedMetadata = () => {
    const video = videoRef.current
    if (!video) return

    const videoDuration = video.duration
    setDuration(videoDuration)
    setIsLoading(false)

    // If we have initial progress, seek to that position
    if (initialProgress && initialProgress.current_time > 0) {
      video.currentTime = initialProgress.current_time
      setCurrentTime(initialProgress.current_time)
    }

    console.log('Video loaded - Duration:', videoDuration)
  }

  const handleTimeUpdate = () => {
    const video = videoRef.current
    if (!video || !duration) return

    const current = video.currentTime
    const watchPerc = (current / duration) * 100

    setCurrentTime(current)
    setWatchPercentage(watchPerc)

    // Save progress every few seconds while playing
    if (enrolled && isPlaying) {
      debouncedSave(current, duration, watchPerc)
    }
  }

  const handleVideoEnd = () => {
    setIsPlaying(false)
    const finalWatchPercentage = 100
    setWatchPercentage(finalWatchPercentage)
    
    // Save final progress as completed
    if (enrolled) {
      saveVideoProgress(duration, duration, finalWatchPercentage, true)
    }
  }

  const handlePlay = () => {
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
    // Save progress when paused
    if (enrolled && duration > 0) {
      const watchPerc = (currentTime / duration) * 100
      debouncedSave(currentTime, duration, watchPerc)
    }
  }

  const handleError = () => {
    setError('Error loading video. Please try again.')
    setIsLoading(false)
  }

  // Control handlers
  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
  }

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video || !duration) return

    const seekTime = (value[0] / 100) * duration
    video.currentTime = seekTime
    setCurrentTime(seekTime)

    const watchPerc = value[0]
    setWatchPercentage(watchPerc)

    // Save progress after seeking
    if (enrolled) {
      debouncedSave(seekTime, duration, watchPerc)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = value[0] / 100
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    if (isMuted) {
      video.volume = volume > 0 ? volume : 0.5
      setIsMuted(false)
      if (volume === 0) setVolume(0.5)
    } else {
      video.volume = 0
      setIsMuted(true)
    }
  }

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  const restart = () => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = 0
    setCurrentTime(0)
    setWatchPercentage(0)
    
    if (enrolled) {
      debouncedSave(0, duration, 0)
    }
  }

  // Hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout

    const resetTimeout = () => {
      setShowControls(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false)
        }
      }, 3000)
    }

    const handleMouseMove = () => resetTimeout()
    const handleMouseLeave = () => {
      if (isPlaying) {
        setShowControls(false)
      }
    }

    const videoElement = videoRef.current
    if (videoElement) {
      videoElement.addEventListener('mousemove', handleMouseMove)
      videoElement.addEventListener('mouseleave', handleMouseLeave)
    }

    resetTimeout()

    return () => {
      clearTimeout(timeout)
      if (videoElement) {
        videoElement.removeEventListener('mousemove', handleMouseMove)
        videoElement.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [isPlaying])

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  if (error) {
    return (
      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center text-white">
          <p className="mb-4">{error}</p>
          <Button onClick={() => {setError(null); setIsLoading(true)}}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden group">
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
            <p>Loading video...</p>
          </div>
        </div>
      )}

      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        poster={thumbnailUrl || undefined}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleVideoEnd}
        onError={handleError}
        preload="metadata"
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Controls overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Play button overlay (center) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            size="lg"
            variant="ghost"
            className="text-white hover:bg-white/20 h-16 w-16 rounded-full"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8 ml-1" />
            )}
          </Button>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Progress bar */}
          <div className="mb-4">
            <Slider
              value={[watchPercentage]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={restart}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>

              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={toggleMute}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                
                <div className="w-20">
                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                  />
                </div>
              </div>

              <div className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {enrolled && watchPercentage > 0 && (
                <div className="text-white text-xs bg-black/50 px-2 py-1 rounded">
                  {Math.round(watchPercentage)}% watched
                </div>
              )}
              
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={toggleFullscreen}
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment overlay for non-enrolled users */}
      {!enrolled && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="text-center text-white">
            <h3 className="text-xl font-semibold mb-2">Preview Mode</h3>
            <p className="mb-4">Enroll in this course to track your progress</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}