'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import Link from 'next/link'

const EditRecipePage = () => {
  const params = useParams()
  const recipeId = params.id as string

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Edit Recipe</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✏️</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Recipe Editing - Coming Soon!
            </h3>
            <p className="text-gray-500 mb-2">
              Recipe ID: {recipeId}
            </p>
            <p className="text-gray-500 mb-6">
              We're working on recipe editing functionality.
            </p>
            <Link
              href="/"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditRecipePage
