// components/VideoPlayer.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Download, Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react'

interface VideoPlayerProps {
  videoId: string
  videoUrl: string
  title?: string
  initialProgress?: number
}

export default function VideoPlayer({ 
  videoId, 
  videoUrl, 
  title = 'Video',
  initialProgress = 0 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedProgressRef = useRef<number>(0)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(initialProgress)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [isProgressSaving, setIsProgressSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Debounced progress saving
  const debouncedSaveProgress = useCallback((progressPercent: number) => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Only save if progress has changed significantly (more than 1%)
    if (Math.abs(progressPercent - lastSavedProgressRef.current) < 1) {
      return
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(() => {
      saveVideoProgress(progressPercent)
    }, 2000) // Debounce by 2 seconds
  }, [])

  const saveVideoProgress = async (progressPercent: number) => {
    if (isProgressSaving) return // Prevent multiple simultaneous saves
    
    setIsProgressSaving(true)
    setSaveError(null)
    
    try {
      const response = await fetch(`/api/videos/${videoId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          progress: Math.round(progressPercent * 100) / 100,
          duration: Math.round(duration * 100) / 100
        })
      })

      if (!response.ok) {
        let errorMessage = 'Failed to save progress'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('Progress saved successfully:', result)
      lastSavedProgressRef.current = progressPercent
      
    } catch (error) {
      console.error('Error saving video progress:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save progress'
      setSaveError(errorMessage)
      
      // Retry after 5 seconds if it's a network error
      if (error instanceof Error && error.message.includes('409')) {
        console.log('Retrying progress save after conflict...')
        setTimeout(() => saveVideoProgress(progressPercent), 5000)
      }
    } finally {
      setIsProgressSaving(false)
    }
  }

  // Save progress when video time updates
  useEffect(() => {
    if (duration > 0 && currentTime > 0) {
      const currentProgress = (currentTime / duration) * 100
      debouncedSaveProgress(currentProgress)
    }
  }, [currentTime, duration, debouncedSaveProgress])

  // Save progress when component unmounts or video changes
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      // Save immediately on unmount if there's unsaved progress
      if (duration > 0 && currentTime > 0 && !isProgressSaving) {
        const currentProgress = (currentTime / duration) * 100
        if (Math.abs(currentProgress - lastSavedProgressRef.current) >= 1) {
          saveVideoProgress(currentProgress)
        }
      }
    }
  }, [videoId])

  const handlePlayPause = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play().catch((error) => {
        console.error('Error playing video:', error)
      })
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    
    const current = videoRef.current.currentTime
    const total = videoRef.current.duration
    
    if (isNaN(current) || isNaN(total) || total === 0) return
    
    setCurrentTime(current)
    setProgress((current / total) * 100)
  }

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return
    
    const videoDuration = videoRef.current.duration
    if (isNaN(videoDuration) || videoDuration === 0) return
    
    setDuration(videoDuration)
    
    // Set initial position based on saved progress
    if (initialProgress > 0 && initialProgress <= 100) {
      const startTime = (initialProgress / 100) * videoDuration
      videoRef.current.currentTime = startTime
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || duration === 0) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const newTime = percent * duration
    
    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
    setProgress(percent * 100)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    
    if (isMuted) {
      videoRef.current.volume = volume
      setIsMuted(false)
    } else {
      videoRef.current.volume = 0
      setIsMuted(true)
    }
  }

  const toggleFullscreen = async () => {
    if (!videoRef.current) return
    
    try {
      if (!isFullscreen) {
        await videoRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (error) {
      console.error('Fullscreen error:', error)
    }
  }

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const handleDownload = async () => {
    setIsDownloading(true)
    setDownloadError(null)

    try {
      const response = await fetch(`/api/videos/${videoId}/download`, {
        method: 'GET',
      })

      if (!response.ok) {
        let errorMessage = 'Download failed'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title}.mp4`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

    } catch (error) {
      console.error('Download error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Download failed'
      setDownloadError(errorMessage)
    } finally {
      setIsDownloading(false)
    }
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00'
    
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error('Video error:', e.currentTarget.error)
  }

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        src={videoUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={handleVideoError}
        className="w-full h-auto"
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>

      {/* Video Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        {/* Progress Bar */}
        <div 
          className="w-full h-2 bg-gray-600 rounded-full mb-4 cursor-pointer"
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-blue-500 rounded-full transition-all duration-200"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePlayPause}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label={isMuted ? 'Unmute video' : 'Mute video'}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                aria-label="Volume control"
              />
            </div>

            <span className="text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded transition-colors"
              aria-label="Download video"
            >
              <Download size={16} />
              <span className="text-sm">
                {isDownloading ? 'Downloading...' : 'Download'}
              </span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              <Maximize size={20} />
            </button>
          </div>
        </div>

        {/* Error Messages */}
        {downloadError && (
          <div className="mt-2 p-2 bg-red-500/20 border border-red-500 rounded text-red-300 text-sm">
            Download Error: {downloadError}
          </div>
        )}
        
        {saveError && (
          <div className="mt-2 p-2 bg-yellow-500/20 border border-yellow-500 rounded text-yellow-300 text-sm">
            Save Error: {saveError}
          </div>
        )}
        
        {isProgressSaving && (
          <div className="mt-2 p-2 bg-blue-500/20 border border-blue-500 rounded text-blue-300 text-sm">
            Saving progress...
          </div>
        )}
      </div>
    </div>
  )
}