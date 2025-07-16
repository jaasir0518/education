'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react'

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
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Progress tracking
  const [lastSavedTime, setLastSavedTime] = useState(initialProgress?.current_time || 0)
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Debounced progress save function
  const saveVideoProgress = useCallback(async (currentTime: number, duration: number, completed: boolean = false) => {
    if (!enrolled || isSaving) return
    
    const watchPercentage = duration > 0 ? (currentTime / duration) * 100 : 0
    
    // Only save if significant progress has been made (more than 5 seconds difference)
    if (Math.abs(currentTime - lastSavedTime) < 5 && !completed) {
      return
    }

    setIsSaving(true)
    
    try {
      const response = await fetch('/api/video-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          userId,
          currentTime: Math.floor(currentTime),
          duration: Math.floor(duration),
          completed,
          watchPercentage: Math.min(watchPercentage, 100)
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save progress')
      }

      setLastSavedTime(currentTime)
      setError(null)
    } catch (error) {
      console.error('Error saving video progress:', error)
      setError('Failed to save progress')
    } finally {
      setIsSaving(false)
    }
  }, [enrolled, courseId, userId, lastSavedTime, isSaving])

  // Debounced save function
  const debouncedSave = useCallback((currentTime: number, duration: number, completed: boolean = false) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }

    // Save immediately if completed, otherwise debounce
    if (completed) {
      saveVideoProgress(currentTime, duration, true)
    } else {
      const timeout = setTimeout(() => {
        saveVideoProgress(currentTime, duration, false)
      }, 2000) // Save after 2 seconds of inactivity
      setSaveTimeout(timeout)
    }
  }, [saveTimeout, saveVideoProgress])

  // Video event handlers
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration
      setDuration(videoDuration)
      
      // Set initial time if we have saved progress
      if (initialProgress?.current_time && initialProgress.current_time > 0) {
        videoRef.current.currentTime = initialProgress.current_time
        setCurrentTime(initialProgress.current_time)
      }
      
      // Update course duration in database if it's different
      if (enrolled && videoDuration > 0 && (!initialProgress?.duration || Math.abs(initialProgress.duration - videoDuration) > 5)) {
        debouncedSave(initialProgress?.current_time || 0, videoDuration, false)
      }
    }
  }, [enrolled, initialProgress, debouncedSave])

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime
      const total = videoRef.current.duration
      
      setCurrentTime(current)
      
      // Auto-save progress periodically
      if (enrolled && total > 0) {
        debouncedSave(current, total, false)
      }
    }
  }, [enrolled, debouncedSave])

  const handleVideoEnd = useCallback(() => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime
      const total = videoRef.current.duration
      
      setIsPlaying(false)
      
      // Mark as completed when video ends
      if (enrolled && total > 0) {
        debouncedSave(current, total, true)
      }
    }
  }, [enrolled, debouncedSave])

  const handlePlay = useCallback(() => {
    setIsPlaying(true)
  }, [])

  const handlePause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const handleVolumeChange = useCallback(() => {
    if (videoRef.current) {
      setVolume(videoRef.current.volume)
      setIsMuted(videoRef.current.muted)
    }
  }, [])

  // Control handlers
  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }, [isPlaying])

  const handleSeek = useCallback((value: number[]) => {
    if (videoRef.current) {
      const seekTime = value[0]
      videoRef.current.currentTime = seekTime
      setCurrentTime(seekTime)
      
      // Save progress when seeking
      if (enrolled && duration > 0) {
        debouncedSave(seekTime, duration, false)
      }
    }
  }, [enrolled, duration, debouncedSave])

  const handleVolumeSliderChange = useCallback((value: number[]) => {
    if (videoRef.current) {
      const newVolume = value[0]
      videoRef.current.volume = newVolume
      setVolume(newVolume)
      setIsMuted(newVolume === 0)
    }
  }, [])

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }, [isMuted])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  // Format time display
  const formatTime = useCallback((seconds: number) => {
    if (isNaN(seconds)) return '0:00'
    
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [])

  // Hide controls after inactivity
  useEffect(() => {
    let hideControlsTimeout: NodeJS.Timeout

    const resetHideControlsTimeout = () => {
      setShowControls(true)
      clearTimeout(hideControlsTimeout)
      hideControlsTimeout = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false)
        }
      }, 3000)
    }

    resetHideControlsTimeout()

    const handleMouseMove = () => resetHideControlsTimeout()
    const handleMouseLeave = () => {
      if (isPlaying) {
        setShowControls(false)
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      clearTimeout(hideControlsTimeout)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [isPlaying])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout)
      }
    }
  }, [saveTimeout])

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  if (!enrolled) {
    return (
      <div className="relative w-full aspect-video bg-gray-900 flex items-center justify-center">
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">🔒</div>
            <h3 className="text-2xl font-bold mb-2">Enroll to Watch</h3>
            <p className="text-gray-300">Sign up for this course to access the video content</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full aspect-video bg-black group">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleVideoEnd}
        onVolumeChange={handleVolumeChange}
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onError={(e) => {
          setError('Error loading video')
          setIsLoading(false)
        }}
        preload="metadata"
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white text-lg">Loading...</div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded text-sm">
          {error}
        </div>
      )}

      {/* Saving indicator */}
      {isSaving && (
        <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded text-sm">
          Saving progress...
        </div>
      )}

      {/* Controls overlay */}
      <div className={`absolute inset-0 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Play/Pause button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="ghost"
            size="lg"
            onClick={togglePlayPause}
            className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-4"
          >
            {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
          </Button>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          {/* Progress bar */}
          <div className="mb-4">
            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              onValueChange={handleSeek}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-white mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlayPause}
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <div className="w-20">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.1}
                    onValueChange={handleVolumeSliderChange}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="text-white text-sm">
                {Math.round(progressPercentage)}%
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}