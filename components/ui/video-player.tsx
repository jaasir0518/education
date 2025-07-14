'use client'

import { useEffect, useRef, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react'
import { Button } from './button'

interface VideoPlayerProps {
  videoUrl: string
  thumbnailUrl: string | null
  title: string
  enrolled: boolean
  courseId: string
  userId: string
  onVideoComplete?: () => void
}

export function VideoPlayer({ 
  videoUrl, 
  thumbnailUrl, 
  title, 
  enrolled, 
  courseId, 
  userId,
  onVideoComplete 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [progress, setProgress] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  
  const supabase = createClientComponentClient()
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load existing progress
  useEffect(() => {
    if (enrolled && courseId && userId) {
      loadVideoProgress()
    }
  }, [enrolled, courseId, userId])

  const loadVideoProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('video_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading video progress:', error)
        return
      }

      if (data) {
        setProgress(data.watched_duration)
        setIsCompleted(data.completed)
        if (videoRef.current && data.watched_duration > 0) {
          videoRef.current.currentTime = data.watched_duration
        }
      }
    } catch (error) {
      console.error('Error loading video progress:', error)
    }
  }

  const saveVideoProgress = async (watchedDuration: number, totalDuration: number) => {
    if (!enrolled || !courseId || !userId) return

    try {
      const completionThreshold = 0.9 // 90% completion threshold
      const completed = watchedDuration >= totalDuration * completionThreshold
      
      const { error } = await supabase
        .from('video_progress')
        .upsert({
          user_id: userId,
          course_id: courseId,
          watched_duration: Math.floor(watchedDuration),
          total_duration: Math.floor(totalDuration),
          completed: completed,
          last_watched_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error saving video progress:', error)
      } else if (completed && !isCompleted) {
        setIsCompleted(true)
        onVideoComplete?.()
      }
    } catch (error) {
      console.error('Error saving video progress:', error)
    }
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
      setHasStarted(true)
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    
    const current = videoRef.current.currentTime
    const total = videoRef.current.duration
    
    setCurrentTime(current)
    setDuration(total)
    
    if (enrolled && hasStarted && total > 0) {
      // Save progress every 10 seconds
      if (Math.floor(current) % 10 === 0) {
        saveVideoProgress(current, total)
      }
    }
  }

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return
    setDuration(videoRef.current.duration)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return
    const time = parseFloat(e.target.value)
    videoRef.current.currentTime = time
    setCurrentTime(time)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return
    const vol = parseFloat(e.target.value)
    setVolume(vol)
    videoRef.current.volume = vol
    setIsMuted(vol === 0)
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

  const toggleFullscreen = () => {
    if (!videoRef.current) return
    
    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Auto-hide controls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [isPlaying, showControls])

  // Save progress on component unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && enrolled && hasStarted) {
        saveVideoProgress(videoRef.current.currentTime, videoRef.current.duration)
      }
    }
  }, [enrolled, hasStarted])

  return (
    <div 
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group"
      onMouseEnter={() => setShowControls(true)}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnailUrl || undefined}
        className="w-full h-full object-cover"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false)
          if (enrolled) {
            saveVideoProgress(duration, duration)
          }
        }}
        onClick={togglePlay}
      />

      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <Button
            size="lg"
            className="rounded-full w-16 h-16 flex items-center justify-center bg-white bg-opacity-90 hover:bg-opacity-100"
            onClick={togglePlay}
          >
            <Play className="w-6 h-6 text-black ml-1" />
          </Button>
        </div>
      )}

      {/* Completion Badge */}
      {isCompleted && (
        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
          ✅ Completed
        </div>
      )}

      {/* Controls */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100}%, #4b5563 100%)`
              }}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                className="text-white hover:text-gray-300"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:text-gray-300"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:text-gray-300"
              >
                <Maximize className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}