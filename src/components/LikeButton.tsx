'use client'

import React, { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

interface LikeButtonProps {
  recipeId: string
  isLiked: boolean
  likesCount: number
  size?: 'sm' | 'md' | 'lg'
}

export const LikeButton: React.FC<LikeButtonProps> = ({ 
  recipeId, 
  isLiked: initialIsLiked, 
  likesCount: initialLikesCount,
  size = 'md'
}) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  useEffect(() => {
    setIsLiked(initialIsLiked)
    setLikesCount(initialLikesCount)
  }, [initialIsLiked, initialLikesCount])

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast.error('Please sign in to like recipes')
      return
    }

    if (isLoading) return

    setIsLoading(true)
    
    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .match({ user_id: user.id, recipe_id: recipeId })

        if (error) throw error

        // Update recipe likes count
        const { error: updateError } = await supabase.rpc('decrement_likes', {
          recipe_id: recipeId
        })

        if (updateError) throw updateError

        setIsLiked(false)
        setLikesCount(prev => prev - 1)
        toast.success('Recipe unliked')
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({ user_id: user.id, recipe_id: recipeId })

        if (error) throw error

        // Update recipe likes count
        const { error: updateError } = await supabase.rpc('increment_likes', {
          recipe_id: recipeId
        })

        if (updateError) throw updateError

        setIsLiked(true)
        setLikesCount(prev => prev + 1)
        toast.success('Recipe liked!')
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center space-x-1 transition-all duration-200 ${
        isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
      }`}
    >
      <Heart 
        className={`${sizeClasses[size]} transition-colors ${
          isLiked 
            ? 'fill-red-500 text-red-500' 
            : 'text-gray-600 hover:text-red-500'
        }`}
      />
      <span className={`${textSizeClasses[size]} text-gray-600`}>
        {likesCount}
      </span>
    </button>
  )
}
