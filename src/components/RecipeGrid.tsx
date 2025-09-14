'use client'

import React from 'react'
import Link from 'next/link'
import { RecipeCard } from './RecipeCard'
import type { Recipe } from '@/lib/types'

interface RecipeGridProps {
  recipes: Recipe[]
  emptyMessage?: string
  showCreateButton?: boolean
}

export const RecipeGrid: React.FC<RecipeGridProps> = ({ 
  recipes, 
  emptyMessage = 'No recipes found',
  showCreateButton = true
}) => {
  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🍽️</div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-500 mb-6">
          Start sharing your delicious recipes with the world!
        </p>
        {showCreateButton && (
          <Link
            href="/recipe/create"
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Create Your First Recipe
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  )
}
