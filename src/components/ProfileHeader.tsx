'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, User } from 'lucide-react'
import { StoryRing } from './StoryRing'
import { FollowButton } from './FollowButton'
import { StoryViewer } from './StoryViewer'
import { HighlightViewer } from './HighlightViewer'
import type { Profile, Story, Highlight } from '@/lib/types'
import { useAuth } from '@/hooks/useAuth'

interface ProfileHeaderProps {
  profile: Profile
  stories: Story[]
  highlights: Highlight[]
  isOwnProfile: boolean
  followersCount: number
  followingCount: number
  recipesCount: number
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  stories,
  highlights,
  isOwnProfile,
  followersCount,
  followingCount,
  recipesCount
}) => {
  const [showStories, setShowStories] = useState(false)
  const [showHighlight, setShowHighlight] = useState<string | null>(null)
  const { user } = useAuth()

  const hasActiveStories = stories.length > 0

  const handleProfilePictureClick = () => {
    if (hasActiveStories) {
      setShowStories(true)
    }
  }

  const handleHighlightClick = (highlightId: string) => {
    setShowHighlight(highlightId)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Username */}
      <h1 className="text-2xl font-bold text-center mb-6">
        @{profile.username}
      </h1>

      {/* Profile Picture and Stats */}
      <div className="flex items-start space-x-8 mb-8">
        {/* Profile Picture */}
        <div className="relative">
          <button
            onClick={handleProfilePictureClick}
            className="relative block"
            disabled={!hasActiveStories}
          >
            <StoryRing hasStory={hasActiveStories} size="lg">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.username}
                  width={120}
                  height={120}
                  className="w-30 h-30 rounded-full object-cover"
                />
              ) : (
                <div className="w-30 h-30 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-500" />
                </div>
              )}
            </StoryRing>
          </button>

          {/* Add Story Button */}
          {isOwnProfile && (
            <Link
              href="/story/create"
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
              title="Create Story"
            >
              <Plus className="w-4 h-4 text-white" />
            </Link>
          )}
        </div>

        {/* Stats and Follow Button */}
        <div className="flex-1">
          <div className="flex items-center space-x-8 mb-4">
            <Link 
              href={`/profile/${profile.username}/followers`}
              className="text-center hover:opacity-80 transition-opacity"
            >
              <div className="text-xl font-bold">{followersCount}</div>
              <div className="text-sm text-gray-600">followers</div>
            </Link>
            
            <Link 
              href={`/profile/${profile.username}/following`}
              className="text-center hover:opacity-80 transition-opacity"
            >
              <div className="text-xl font-bold">{followingCount}</div>
              <div className="text-sm text-gray-600">following</div>
            </Link>

            <div className="text-center">
              <div className="text-xl font-bold">{recipesCount}</div>
              <div className="text-sm text-gray-600">recipes</div>
            </div>
          </div>

          {/* Follow Button */}
          {!isOwnProfile && user && (
            <FollowButton
              targetUserId={profile.id}
              isFollowing={profile.is_following || false}
            />
          )}
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="text-center mb-8">
          <p className="text-gray-700 max-w-md mx-auto">{profile.bio}</p>
        </div>
      )}

      {/* Highlights */}
      {highlights.length > 0 && (
        <div className="mb-8">
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {highlights.map((highlight) => (
              <button
                key={highlight.id}
                onClick={() => handleHighlightClick(highlight.id)}
                className="flex-shrink-0 text-center"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 mb-1">
                  <Image
                    src={highlight.cover_image}
                    alt={highlight.title}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-gray-600 max-w-16 truncate">
                  {highlight.title}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Story Viewer Modal */}
      {showStories && (
        <StoryViewer
          stories={stories}
          onClose={() => setShowStories(false)}
        />
      )}

      {/* Highlight Viewer Modal */}
      {showHighlight && (
        <HighlightViewer
          highlightId={showHighlight}
          highlights={highlights}
          onClose={() => setShowHighlight(null)}
        />
      )}
    </div>
  )
}
