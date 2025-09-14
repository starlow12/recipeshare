'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { ProfileHeader } from '@/components/ProfileHeader'
import { RecipeGrid } from '@/components/RecipeGrid'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import type { Profile, Recipe, Story, Highlight } from '@/lib/types'

const ProfilePage = () => {
  const params = useParams()
  const username = params.username as string
  const { user } = useAuth()
  
  const [profile, setProfile] = useState<Profile | null>(null)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [likedRecipes, setLikedRecipes] = useState<Recipe[]>([])
  const [stories, setStories] = useState<Story[]>([])
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [activeTab, setActiveTab] = useState<'my-recipes' | 'liked' | 'tagged'>('my-recipes')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isOwnProfile = user && profile && user.id === profile.id

  useEffect(() => {
    if (username) {
      fetchProfile()
    }
  }, [username, user])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          setError('Profile not found')
        } else {
          throw profileError
        }
        return
      }

      // Check if current user follows this profile
      let isFollowing = false
      if (user && user.id !== profileData.id) {
        const { data: followData } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', profileData.id)
          .single()

        isFollowing = !!followData
      }

      setProfile({ ...profileData, is_following: isFollowing })

      // Fetch follower/following counts
      const [followersResult, followingResult] = await Promise.all([
        supabase
          .from('follows')
          .select('id', { count: 'exact' })
          .eq('following_id', profileData.id),
        supabase
          .from('follows')
          .select('id', { count: 'exact' })
          .eq('follower_id', profileData.id)
      ])

      setFollowersCount(followersResult.count || 0)
      setFollowingCount(followingResult.count || 0)

      // Fetch user's recipes
      await fetchUserRecipes(profileData.id)

      // Fetch user's liked recipes (only if own profile)
      if (user && user.id === profileData.id) {
        await fetchLikedRecipes(profileData.id)
      }

      // Fetch stories (active ones)
      await fetchStories(profileData.id)

      // Fetch highlights
      await fetchHighlights(profileData.id)

    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserRecipes = async (userId: string) => {
    try {
      const { data: recipesData, error } = await supabase
        .from('recipes')
        .select(`
          *,
          profiles!recipes_created_by_fkey (
            username,
            avatar_url
          )
        `)
        .eq('created_by', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Check which recipes are liked/saved by current user
      let recipesWithStatus = recipesData || []
      
      if (user && recipesData) {
        const recipeIds = recipesData.map(r => r.id)
        
        const [likesResult, savedResult] = await Promise.all([
          supabase
            .from('likes')
            .select('recipe_id')
            .eq('user_id', user.id)
            .in('recipe_id', recipeIds),
          supabase
            .from('saved_recipes')
            .select('recipe_id')
            .eq('user_id', user.id)
            .in('recipe_id', recipeIds)
        ])

        const likedRecipeIds = new Set(likesResult.data?.map(l => l.recipe_id) || [])
        const savedRecipeIds = new Set(savedResult.data?.map(s => s.recipe_id) || [])

        recipesWithStatus = recipesData.map(recipe => ({
          ...recipe,
          is_liked: likedRecipeIds.has(recipe.id),
          is_saved: savedRecipeIds.has(recipe.id)
        }))
      }

      setRecipes(recipesWithStatus)
    } catch (error) {
      console.error('Error fetching user recipes:', error)
    }
  }

  const fetchLikedRecipes = async (userId: string) => {
    try {
      const { data: likedData, error } = await supabase
        .from('saved_recipes')
        .select(`
          recipes (
            *,
            profiles!recipes_created_by_fkey (
              username,
              avatar_url
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const likedRecipes = likedData?.map(item => ({
        ...item.recipes,
        is_liked: false, // We'll check this separately
        is_saved: true
      })) || []

      // Check which recipes are liked by current user
      if (likedRecipes.length > 0) {
        const recipeIds = likedRecipes.map(r => r.id)
        
        const { data: likesResult } = await supabase
          .from('likes')
          .select('recipe_id')
          .eq('user_id', userId)
          .in('recipe_id', recipeIds)

        const likedRecipeIds = new Set(likesResult?.map(l => l.recipe_id) || [])

        const recipesWithLikes = likedRecipes.map(recipe => ({
          ...recipe,
          is_liked: likedRecipeIds.has(recipe.id)
        }))

        setLikedRecipes(recipesWithLikes)
      }
    } catch (error) {
      console.error('Error fetching liked recipes:', error)
    }
  }

  const fetchStories = async (userId: string) => {
    try {
      const { data: storiesData, error } = await supabase
        .from('stories')
        .select(`
          *,
          profiles!stories_user_id_fkey (
            username,
            avatar_url
          )
        `)
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error

      setStories(storiesData || [])
    } catch (error) {
      console.error('Error fetching stories:', error)
    }
  }

  const fetchHighlights = async (userId: string) => {
    try {
      const { data: highlightsData, error } = await supabase
        .from('highlights')
        .select(`
          *,
          highlight_stories (
            stories (
              *,
              profiles!stories_user_id_fkey (
                username,
                avatar_url
              )
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const highlightsWithStories = highlightsData?.map(highlight => ({
        ...highlight,
        stories: highlight.highlight_stories
          ?.map(hs => hs.stories)
          .filter(Boolean)
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      })) || []

      setHighlights(highlightsWithStories)
    } catch (error) {
      console.error('Error fetching highlights:', error)
    }
  }

  const getCurrentRecipes = () => {
    switch (activeTab) {
      case 'my-recipes':
        return recipes
      case 'liked':
        return isOwnProfile ? likedRecipes : []
      case 'tagged':
        return [] // TODO: Implement tagged recipes
      default:
        return recipes
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

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error || 'Profile not found'}
            </h2>
            <p className="text-gray-600">The user you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <ProfileHeader
        profile={profile}
        stories={stories}
        highlights={highlights}
        isOwnProfile={isOwnProfile || false}
        followersCount={followersCount}
        followingCount={followingCount}
        recipesCount={recipes.length}
      />

      {/* Recipe Categories Tabs */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex space-x-8 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('my-recipes')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'my-recipes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Recipes ({recipes.length})
          </button>

          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('liked')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'liked'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Liked Recipes ({likedRecipes.length})
            </button>
          )}

          <button
            onClick={() => setActiveTab('tagged')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'tagged'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Tagged Recipes (0)
          </button>
        </div>

        {/* Recipes Grid */}
        <RecipeGrid recipes={getCurrentRecipes()} />
      </div>
    </div>
  )
}

export default ProfilePage
