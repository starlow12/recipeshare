'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Navigation } from '@/components/Navigation'
import { ArrowLeft } from 'lucide-react'

const FollowersPage = () => {
  const params = useParams()
  const username = params.username as string

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link
            href={`/profile/${username}`}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Followers</h1>
            <p className="text-gray-600">@{username}</p>
          </div>
        </div>

        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Followers - Coming Soon!
          </h3>
          <p className="text-gray-500">
            This feature will be available soon.
          </p>
        </div>
      </div>
    </div>
  )
}

export default FollowersPage
