'use client'

import React from 'react'
import { Navigation } from '@/components/Navigation'

const LikedRecipesPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Saved Recipes
          </h1>
          <p className="text-gray-600">
            Your collection of favorite recipes - Coming Soon!
          </p>
        </div>
      </div>
    </div>
  )
}

export default LikedRecipesPage
