'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Story } from '@/lib/types'

interface StoryViewerProps {
  stories: Story[]
  onClose: () => void
  initialIndex?: number
}

export const StoryViewer: React.FC<StoryViewerProps> = ({
  stories,
  onClose,
  initialIndex = 0
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const currentStory = stories[currentIndex]
  const STORY_DURATION = 5000 // 5 seconds

  const goNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setProgress(0)
    } else {
      onClose()
    }
  }, [currentIndex, stories.length, onClose])

  const goPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setProgress(0)
    }
  }, [currentIndex])

  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (STORY_DURATION / 100))
        
        if (newProgress >= 100) {
          goNext()
          return 0
        }
        
        return newProgress
      })
    }, 100)

    return () => clearInterval(interval)
  }, [goNext, isPaused])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowRight') {
        goNext()
      } else if (e.key === 'ArrowLeft') {
        goPrevious()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goNext, goPrevious, onClose])

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = (clickX / rect.width) * 100

    if (percentage < 50) {
      goPrevious()
    } else {
      goNext()
    }
  }

  if (!currentStory) return null

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="relative w-full max-w-md h-full bg-black">
        {/* Progress Bars */}
        <div className="absolute top-2 left-2 right-2 z-10 flex space-x-1">
          {stories.map((_, index) => (
            <div
              key={index}
              className="flex-1 h-0.5 bg-gray-600 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{
                  width: index < currentIndex 
                    ? '100%' 
                    : index === currentIndex 
                    ? `${progress}%` 
                    : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-6 left-2 right-2 z-10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {currentStory.profiles?.avatar_url && (
              <Image
                src={currentStory.profiles.avatar_url}
                alt={currentStory.profiles.username || ''}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover border border-white"
              />
            )}
            <span className="text-white text-sm font-medium">
              @{currentStory.profiles?.username}
            </span>
          </div>
          
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Story Content */}
        <div
          className="w-full h-full flex items-center justify-center cursor-pointer"
          onClick={handleProgressClick}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {currentStory.media_type === 'image' ? (
            <Image
              src={currentStory.media_url}
              alt="Story"
              width={400}
              height={800}
              className="max-w-full max-h-full object-contain"
              priority
            />
          ) : (
            <video
              src={currentStory.media_url}
              className="max-w-full max-h-full object-contain"
              autoPlay
              muted
              loop
            />
          )}
        </div>

        {/* Text Overlay */}
        {currentStory.text_overlay && (
          <div className="absolute bottom-20 left-4 right-4 z-10">
            <p className="text-white text-center text-lg font-medium bg-black bg-opacity-50 rounded-lg p-3">
              {currentStory.text_overlay}
            </p>
          </div>
        )}

        {/* Navigation Arrows */}
        {currentIndex > 0 && (
          <button
            onClick={goPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}

        {currentIndex < stories.length - 1 && (
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}
      </div>
    </div>
  )
}
