'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Lock } from 'lucide-react'

interface VideoPlayerProps {
  videoUrl: string
  thumbnailUrl?: string | null
  title: string
  enrolled: boolean
}

export function VideoPlayer({ videoUrl, thumbnailUrl, title, enrolled }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showVideo, setShowVideo] = useState(false)

  const handlePlayClick = () => {
    if (!enrolled) {
      // If not enrolled, just show a preview or redirect to enrollment
      return
    }
    setShowVideo(true)
    setIsPlaying(true)
  }

  const handleVideoLoad = () => {
    setIsPlaying(true)
  }

  if (!enrolled) {
    return (
      <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
        {/* Thumbnail or placeholder */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: thumbnailUrl 
              ? `url(${thumbnailUrl})` 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40" />
        </div>
        
        {/* Preview overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="mb-4">
              <Lock className="w-12 h-12 mx-auto mb-2 opacity-80" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Course Preview</h3>
            <p className="text-sm opacity-80 mb-4">Enroll to access full course content</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
      {!showVideo ? (
        // Thumbnail with play button
        <div 
          className="absolute inset-0 bg-cover bg-center cursor-pointer"
          onClick={handlePlayClick}
          style={{
            backgroundImage: thumbnailUrl 
              ? `url(${thumbnailUrl})` 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              size="lg"
              className="bg-white bg-opacity-90 hover:bg-opacity-100 text-black rounded-full w-16 h-16 p-0"
              onClick={handlePlayClick}
            >
              <Play className="w-8 h-8 ml-1" />
            </Button>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white text-lg font-semibold drop-shadow-lg">
              {title}
            </h3>
          </div>
        </div>
      ) : (
        // Video player
        <div className="absolute inset-0">
          <video
            className="w-full h-full object-cover"
            controls
            autoPlay
            onLoadedData={handleVideoLoad}
            poster={thumbnailUrl || undefined}
          >
            <source src={videoUrl} type="video/mp4" />
            <source src={videoUrl} type="video/webm" />
            <source src={videoUrl} type="video/ogg" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  )
}