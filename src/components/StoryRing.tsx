'use client'

import React from 'react'

interface StoryRingProps {
  hasStory: boolean
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export const StoryRing: React.FC<StoryRingProps> = ({ 
  hasStory, 
  size = 'md', 
  children 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-0.5'
      case 'md':
        return 'p-1'
      case 'lg':
        return 'p-1.5'
      default:
        return 'p-1'
    }
  }

  return (
    <div
      className={`rounded-full ${getSizeClasses()} ${
        hasStory
          ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500'
          : 'bg-gray-200'
      }`}
    >
      <div className="bg-white rounded-full p-0.5">
        {children}
      </div>
    </div>
  )
}
