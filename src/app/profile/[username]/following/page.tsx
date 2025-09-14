'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Navigation } from '@/components/Navigation'
import { FollowButton } from '@/components/FollowButton'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useFollow } from '@/hooks/useFollow'
import { ArrowLeft, User } from 'lucide-react'
import type { Profile } from '@/lib/types'

const FollowingPage = () => {
  const params = useParams()
  const username = params.username as string
  const { user } = useAuth()
  const { getFollowing, getFollowCounts } = useFollow()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [following, setFollowing] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [followingCount, setFollowingCount] = useState(0)

  useEffect(() => {
    if (username) {
      fetchData()
    }
  }, [username, user])

  const fetchData = async () => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (profileError) throw profileError
      setProfile(profileData)

      // Fetch following
      const followingData = await getFollowing(profileData.id)
      setFollowing(followingData)

      // Get counts
      const counts = await getFollowCounts(profileData.id)
      setFollowingCount(counts.following)

    } catch (error) {
      console.error('Error fetching following:', error)
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile not found</h2>
            <p className="text-gray-600">The user you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    )
  }

  const isOwnProfile = user && user.id === profile.id

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link
            href={`/profile/${username}`}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Following</h1>
            <p className="text-gray-600">@{username}</p>
          </div>
        </div>

        {/* Following List */}
        {following.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm">
            {following.map((followedUser, index) => (
              <div key={followedUser.id} className={`flex items-center justify-between p-4 ${
                index !== following.length - 1 ? 'border-b border-gray-200' : ''
              }`}>
                <Link
                  href={`/profile/${followedUser.username}`}
                  className="flex items-center flex-1 hover:opacity-80 transition-opacity"
                >
                  {followedUser.avatar_url ? (
                    <Image
                      src={followedUser.avatar_url}
                      alt={followedUser.username}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover mr-3"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                      <User className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {followedUser.full_name || `@${followedUser.username}`}
                    </p>
                    <p className="text-sm text-gray-600">@{followedUser.username}</p>
                  </div>
                </Link>

                {user && (user.id !== followedUser.id || isOwnProfile) && (
                  <FollowButton
                    targetUserId={followedUser.id}
                    isFollowing={followedUser.is_following || false}
                    variant="small"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isOwnProfile ? "You're not following anyone yet" : `@${username} isn't following anyone yet`}
            </h3>
            <p className="text-gray-500">
              {isOwnProfile 
                ? "Start following people to see their recipes in your feed" 
                : "When they follow people, they'll appear here."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FollowingPage
