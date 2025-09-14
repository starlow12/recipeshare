'use client'

import React from 'react'
import { Navigation } from '@/components/Navigation'
import Link from 'next/link'

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to RecipeGram
          </h1>
          <p className="text-gray-600">
            Discover and share amazing recipes from around the world
          </p>
          <div className="mt-4 space-x-4">
            <Link
              href="/auth/signup"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Join Now
            </Link>
            <Link
              href="/auth/login"
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Coming Soon!
          </h3>
          <p className="text-gray-500">
            We're building something amazing for food lovers.
          </p>
        </div>
      </div>
    </div>
  )
}

export default HomePage
