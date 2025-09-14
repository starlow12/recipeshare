'use client'

import React, { useState, useEffect } from 'react'
import { Bookmark } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

interface SaveButtonProps {
  recipeId: string
  isSaved: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const SaveButton: React.FC<SaveButtonProps> = ({ 
  recipeId, 
  isSaved: initialIsSaved,
  size = 'md'
}) => {
  const [isSaved, setIsSaved] = useState(initialIsSaved)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  useEffect(() => {
    setIsSaved(initialIsSaved)
  }, [initialIsSaved])

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast.error('Please sign in to save recipes')
      return
    }

    if (isLoading) return

    setIsLoading(true)
    
    try {
      if (isSaved) {
        // Unsave
        const { error } = await supabase
          .from('saved_recipes')
          .delete()
          .match({ user_id: user.id, recipe_id: recipeId })

        if (error) throw error

        setIsSaved(false)
        toast.success('Recipe removed from saved')
      } else {
        // Save
        const { error } = await supabase
          .from('saved_recipes')
          .insert({ user_id: user.id, recipe_id: recipeId })

        if (error) throw error

        setIsSaved(true)
        toast.success('Recipe saved!')
      }
    } catch (error) {
      console.error('Error toggling save:', error)
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleSave}
      disabled={isLoading}
      className={`p-2 rounded-full transition-all duration-200 ${
        isLoading 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:bg-gray-100 hover:scale-110'
      }`}
      title={isSaved ? 'Remove from saved' : 'Save recipe'}
    >
      <Bookmark 
        className={`${sizeClasses[size]} transition-colors ${
          isSaved 
            ? 'fill-blue-500 text-blue-500' 
            : 'text-gray-600 hover:text-blue-500'
        }`}
      />
    </button>
  )
}
