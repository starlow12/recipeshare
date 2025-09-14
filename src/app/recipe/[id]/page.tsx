// app/recipe/[id]/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Navigation } from '@/components/Navigation'
import { LikeButton } from '@/components/LikeButton'
import { SaveButton } from '@/components/SaveButton'
import { CommentSection } from '@/components/CommentSection'
import { EditButton } from '@/components/EditButton'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Clock, Users, ChefHat, User } from 'lucide-react'
import type { Recipe, Ingredient, Instruction } from '@/lib/types'

const RecipeDetailPage = () => {
  const params = useParams()
  const router = useRouter()
  const recipeId = params.id as string
  const { user } = useAuth()

  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (recipeId) {
      fetchRecipe()
    }
  }, [recipeId, user])

  const fetchRecipe = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch recipe with creator info
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .select(`
          *,
          profiles!recipes_created_by_fkey (
            username,
            avatar_url,
            full_name
          )
        `)
        .eq('id', recipeId)
        .single()

      if (recipeError) {
        if (recipeError.code === 'PGRST116') {
          setError('Recipe not found')
        } else {
          throw recipeError
        }
        return
      }

      // Check if current user liked/saved this recipe
      let isLiked = false
      let isSaved = false

      if (user) {
        const [likesResult, savedResult] = await Promise.all([
          supabase
            .from('likes')
            .select('id')
            .eq('user_id', user.id)
            .eq('recipe_id', recipeId)
            .single(),
          supabase
            .from('saved_recipes')
            .select('id')
            .eq('user_id', user.id)
            .eq('recipe_id', recipeId)
            .single()
        ])

        isLiked = !!likesResult.data
        isSaved = !!savedResult.data
      }

      setRecipe({
        ...recipeData,
        is_liked: isLiked,
        is_saved: isSaved
      })

    } catch (error) {
      console.error('Error fetching recipe:', error)
      setError('Failed to load recipe')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error || 'Recipe not found'}
            </h2>
            <p className="text-gray-600 mb-4">The recipe you're looking for doesn't exist.</p>
            <Link
              href="/"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isOwner = user && user.id === recipe.created_by
  const ingredients = recipe.ingredients as Ingredient[]
  const instructions = recipe.instructions as Instruction[]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          {/* Media */}
          {(recipe.image_url || recipe.video_url) && (
            <div className="relative aspect-video">
              {recipe.video_url ? (
                <video
                  src={recipe.video_url}
                  className="w-full h-full object-cover"
                  controls
                />
              ) : (
                <Image
                  src={recipe.image_url!}
                  alt={recipe.title}
                  fill
                  className="object-cover"
                />
              )}
            </div>
          )}

          <div className="p-6">
            {/* Title and Actions */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {recipe.title}
                </h1>
                
                {/* Creator Info */}
                {recipe.profiles && (
                  <Link 
                    href={`/profile/${recipe.profiles.username}`}
                    className="flex items-center hover:opacity-80 transition-opacity mb-4"
                  >
                    {recipe.profiles.avatar_url ? (
                      <Image
                        src={recipe.profiles.avatar_url}
                        alt={recipe.profiles.username}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover mr-3"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {recipe.profiles.full_name || `@${recipe.profiles.username}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        @{recipe.profiles.username}
                      </p>
                    </div>
                  </Link>
                )}
              </div>

              <div className="flex items-center space-x-2 ml-4">
                {isOwner && (
                  <EditButton recipeId={recipe.id} />
                )}
                <SaveButton 
                  recipeId={recipe.id}
                  isSaved={recipe.is_saved || false}
                  size="lg"
                />
              </div>
            </div>

            {/* Recipe Info */}
            <div className="flex items-center space-x-6 mb-4 text-gray-600">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>
                  {recipe.prep_time + recipe.cook_time} min total
                  {recipe.prep_time > 0 && ` (${recipe.prep_time} prep)`}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>{recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center space-x-2">
                <ChefHat className="w-5 h-5" />
                <span>{recipe.category}</span>
              </div>
            </div>

            {/* Description */}
            {recipe.description && (
              <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                {recipe.description}
              </p>
            )}

            {/* Like and Comment Actions */}
            <div className="flex items-center space-x-6 pt-4 border-t border-gray-200">
              <LikeButton 
                recipeId={recipe.id}
                isLiked={recipe.is_liked || false}
                likesCount={recipe.likes_count}
                size="lg"
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Ingredients */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ingredients</h2>
            <div className="space-y-3">
              {ingredients.map((ingredient) => (
                <div 
                  key={ingredient.id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">
                      {ingredient.quantity} {ingredient.type} {ingredient.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Instructions</h2>
            <div className="space-y-4">
              {instructions.map((instruction) => (
                <div key={instruction.id} className="flex space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {instruction.step}
                    </div>
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-gray-700 leading-relaxed">
                      {instruction.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-6" id="comments">
          <CommentSection recipeId={recipe.id} />
        </div>
      </div>
    </div>
  )
}

export default RecipeDetailPage
