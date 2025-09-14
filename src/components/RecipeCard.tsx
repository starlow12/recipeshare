'use client'

import React from 'react'

interface RecipeCardProps {
  recipe: any
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden p-4">
      <h3 className="font-semibold text-lg">{recipe?.title || 'Recipe'}</h3>
      <p className="text-gray-600 text-sm">Sample recipe description</p>
    </div>
  )
}
