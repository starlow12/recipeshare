'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Navigation } from '@/components/Navigation'
import { ArrowLeft, Clock, Users, ChefHat } from 'lucide-react'

const RecipeDetailPage = () => {
  const params = useParams()
  const recipeId = params.id as string

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Recipes
          </Link>
        </div>

        {/* Recipe Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          {/* Placeholder Image */}
          <div className="aspect-video bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-lg">Recipe Image</span>
          </div>

          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Sample Recipe
            </h1>
            
            {/* Recipe Info */}
            <div className="flex items-center space-x-6 mb-4 text-gray-600">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>30 min total</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>4 servings</span>
              </div>
              <div className="flex items-center space-x-2">
                <ChefHat className="w-5 h-5" />
                <span>Main Course</span>
              </div>
            </div>

            <p className="text-gray-700 mb-6 text-lg leading-relaxed">
              Recipe details coming soon! Recipe ID: {recipeId}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Ingredients */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ingredients</h2>
            <div className="text-center py-8">
              <p className="text-gray-500">Ingredients list coming soon!</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Instructions</h2>
            <div className="text-center py-8">
              <p className="text-gray-500">Instructions coming soon!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecipeDetailPage
