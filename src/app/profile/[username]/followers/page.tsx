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

const FollowersPage = () => {
  const params = useParams()
  const username = params.username as string
  const { user } = useAuth()
  const { getFollowers, getFollowCounts, isFollowing } = useFollow()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [followers, setFollowers] = useState<(Profile & { is_following?: boolean })[]>([])
  const [loading, setLoading] = useState(true)
  const [followersCount, setFollowersCount] = useState(0)

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

      // Fetch followers
      const followersData = await getFollowers(profileData.id)
      
      // Check which followers the current user is following
      let followersWithStatus = followersData
      if (user) {
        const followingPromises = followersData.map(follower =>
          isFollowing(follower.id)
        )
        const followingStatuses = await Promise.all(followingPromises)
        
        followersWithStatus = followersData.map((follower, index) => ({
          ...follower,
          is_following: followingStatuses[index]
        }))
      }

      setFollowers(followersWithStatus)

      // Get counts
      const counts = await getFollowCounts(profileData.id)
      setFollowersCount(counts.followers)

    } catch (error) {
      console.error('Error fetching followers:', error)
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
            <h1 className="text-xl font-bold">Followers</h1>
            <p className="text-gray-600">@{username}</p>
          </div>
        </div>

        {/* Followers List */}
        {followers.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm">
            {followers.map((follower, index) => (
              <div key={follower.id} className={`flex items-center justify-between p-4 ${
                index !== followers.length - 1 ? 'border-b border-gray-200' : ''
              }`}>
                <Link
                  href={`/profile/${follower.username}`}
                  className="flex items-center flex-1 hover:opacity-80 transition-opacity"
                >
                  {follower.avatar_url ? (
                    <Image
                      src={follower.avatar_url}
                      alt={follower.username}
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
                      {follower.full_name || `@${follower.username}`}
                    </p>
                    <p className="text-sm text-gray-600">@{follower.username}</p>
                  </div>
                </Link>

                {user && user.id !== follower.id && (
                  <FollowButton
                    targetUserId={follower.id}
                    isFollowing={follower.is_following || false}
                    variant="small"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No followers yet</h3>
            <p className="text-gray-500">When people follow @{username}, they'll appear here.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FollowersPage
