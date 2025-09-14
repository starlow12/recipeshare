'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { User } from 'lucide-react'

const ProfilePage = () => {
  const params = useParams()
  const username = params.username as string

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center mx-auto mb-4">
            <User className="w-16 h-16 text-gray-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            @{username}
          </h1>
          
          <div className="flex justify-center space-x-8 mb-6">
            <div className="text-center">
              <div className="text-xl font-bold">0</div>
              <div className="text-sm text-gray-600">followers</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">0</div>
              <div className="text-sm text-gray-600">following</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">0</div>
              <div className="text-sm text-gray-600">recipes</div>
            </div>
          </div>
        </div>

        {/* Recipe Categories Tabs */}
        <div className="flex space-x-8 border-b border-gray-200 mb-6">
          <button className="py-3 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm">
            My Recipes (0)
          </button>
        </div>

        {/* Empty State */}
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No recipes yet
          </h3>
          <p className="text-gray-500">
            Profile features coming soon!
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
