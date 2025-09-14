'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, Users, Heart } from 'lucide-react'
import { LikeButton } from './LikeButton'
import { SaveButton } from './SaveButton'
import type { Recipe } from '@/lib/types'

interface RecipeCardProps {
  recipe: Recipe
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <Link href={`/recipe/${recipe.id}`}>
        <div className="relative aspect-square">
          {recipe.image_url ? (
            <Image
              src={recipe.image_url}
              alt={recipe.title}
              fill
              className="object-cover"
            />
          ) : recipe.video_url ? (
            <video
              src={recipe.video_url}
              className="w-full h-full object-cover"
              muted
              loop
              onMouseEnter={(e) => e.currentTarget.play()}
              onMouseLeave={(e) => e.currentTarget.pause()}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-2 left-2">
            <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
              {recipe.category}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-4">
        {/* Recipe Title */}
        <Link href={`/recipe/${recipe.id}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {recipe.title}
          </h3>
        </Link>

        {/* Recipe Info */}
        <div className="flex items-center text-sm text-gray-600 mb-3 space-x-4">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{recipe.prep_time + recipe.cook_time} min</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{recipe.servings}</span>
          </div>
        </div>

        {/* Creator Info */}
        {recipe.profiles && (
          <Link 
            href={`/profile/${recipe.profiles.username}`}
            className="flex items-center mb-3 hover:opacity-80 transition-opacity"
          >
            {recipe.profiles.avatar_url ? (
              <Image
                src={recipe.profiles.avatar_url}
                alt={recipe.profiles.username}
                width={24}
                height={24}
                className="w-6 h-6 rounded-full object-cover mr-2"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-300 mr-2" />
            )}
            <span className="text-sm text-gray-600">@{recipe.profiles.username}</span>
          </Link>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <LikeButton 
              recipeId={recipe.id} 
              isLiked={recipe.is_liked || false}
              likesCount={recipe.likes_count}
            />
            <Link 
              href={`/recipe/${recipe.id}#comments`}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Heart className="w-5 h-5" />
              <span className="text-sm">{recipe.comments_count}</span>
            </Link>
          </div>
          
          <SaveButton 
            recipeId={recipe.id}
            isSaved={recipe.is_saved || false}
          />
        </div>

        {/* Description Preview */}
        {recipe.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {recipe.description}
          </p>
        )}
      </div>
    </div>
  )
}
