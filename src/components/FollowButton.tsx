'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

interface FollowButtonProps {
  targetUserId: string
  isFollowing: boolean
  variant?: 'default' | 'small'
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  targetUserId,
  isFollowing: initialIsFollowing,
  variant = 'default'
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    setIsFollowing(initialIsFollowing)
  }, [initialIsFollowing])

  const handleFollow = async () => {
    if (!user) {
      toast.error('Please sign in to follow users')
      return
    }

    if (user.id === targetUserId) {
      toast.error("You can't follow yourself")
      return
    }

    if (isLoading) return

    setIsLoading(true)

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .match({ follower_id: user.id, following_id: targetUserId })

        if (error) throw error

        setIsFollowing(false)
        toast.success('Unfollowed')
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({ follower_id: user.id, following_id: targetUserId })

        if (error) throw error

        setIsFollowing(true)
        toast.success('Following!')
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const buttonClasses = variant === 'small'
    ? 'px-3 py-1 text-sm'
    : 'px-6 py-2'

  return (
    <button
      onClick={handleFollow}
      disabled={isLoading}
      className={`${buttonClasses} rounded-lg font-medium transition-all duration-200 ${
        isLoading
          ? 'opacity-50 cursor-not-allowed'
          : isFollowing
          ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          : 'bg-blue-500 text-white hover:bg-blue-600'
      }`}
    >
      {isLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  )
}
