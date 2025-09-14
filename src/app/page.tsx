'use client'

import React, { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import { RecipeCard } from '@/components/RecipeCard'
import { StoryRing } from '@/components/StoryRing'
import { StoryViewer } from '@/components/StoryViewer'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { Recipe, Story } from '@/lib/types'

const RECIPE_CATEGORIES = [
  'All',
  'Appetizers',
  'Main Courses',
  'Desserts',
  'Beverages',
  'Salads',
  'Soups',
  'Snacks',
  'Breakfast',
  'Lunch',
  'Dinner'
]

const HomePage = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])
  const [storiesData, setStoriesData] = useState<{ [key: string]: Story[] }>({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [viewingStories, setViewingStories] = useState<string | null>(null)
  
  const { user, profile } = useAuth()

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  useEffect(() => {
    filterRecipes()
  }, [recipes, searchTerm, selectedCategory])

  const fetchData = async () => {
    try {
      // Fetch recipes from followed users + own recipes
      const { data: followedUsers } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user!.id)

      const followedUserIds = followedUsers?.map(f => f.following_id) || []
      const userIds = [...followedUserIds, user!.id]

      const { data: recipesData, error: recipesError } = await supabase
        .from('recipes')
        .select(`
          *,
          profiles!recipes_created_by_fkey (
            username,
            avatar_url
          )
        `)
        .in('created_by', userIds)
        .order('created_at', { ascending: false })

      if (recipesError) throw recipesError

      // Check which recipes are liked/saved by current user
      const recipeIds = recipesData?.map(r => r.id) || []
      
      const [likesResult, savedResult] = await Promise.all([
        supabase
          .from('likes')
          .select('recipe_id')
          .eq('user_id', user!.id)
          .in('recipe_id', recipeIds),
        supabase
          .from('saved_recipes')
          .select('recipe_id')
          .eq('user_id', user!.id)
          .in('recipe_id', recipeIds)
      ])

      const likedRecipeIds = new Set(likesResult.data?.map(l => l.recipe_id) || [])
      const savedRecipeIds = new Set(savedResult.data?.map(s => s.recipe_id) || [])

      const recipesWithStatus = recipesData?.map(recipe => ({
        ...recipe,
        is_liked: likedRecipeIds.has(recipe.id),
        is_saved: savedRecipeIds.has(recipe.id)
      })) || []

      setRecipes(recipesWithStatus)

      // Fetch stories from followed users
      const { data: storiesData, error: storiesError } = await supabase
        .from('stories')
        .select(`
          *,
          profiles!stories_user_id_fkey (
            username,
            avatar_url
          )
        `)
        .in('user_id', userIds)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      if (storiesError) throw storiesError

      // Group stories by user
      const groupedStories: { [key: string]: Story[] } = {}
      storiesData?.forEach(story => {
        if (!groupedStories[story.user_id]) {
          groupedStories[story.user_id] = []
        }
        groupedStories[story.user_id].push(story)
      })

      setStoriesData(groupedStories)

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterRecipes = () => {
    let filtered = recipes

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(recipe =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(recipe => recipe.category === selectedCategory)
    }

    setFilteredRecipes(filtered)
  }

  const handleStoryClick = (userId: string) => {
    setViewingStories(userId)
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

  const storyUsers = Object.entries(storiesData).map(([userId, stories]) => ({
    userId,
    stories,
    profile: stories[0]?.profiles
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stories Section */}
        {storyUsers.length > 0 && (
          <div className="mb-8">
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {storyUsers.map(({ userId, stories, profile }) => (
                <button
                  key={userId}
                  onClick={() => handleStoryClick(userId)}
                  className="flex-shrink-0 text-center"
                >
                  <StoryRing hasStory={true} size="md">
                    {profile?.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt={profile.username || ''}
                        width={60}
                        height={60}
                        className="w-15 h-15 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-15 h-15 rounded-full bg-gray-300" />
                    )}
                  </StoryRing>
                  <p className="text-xs text-gray-600 mt-1 max-w-16 truncate">
                    {profile?.username}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {RECIPE_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Recipes Grid */}
        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              {searchTerm || selectedCategory !== 'All' 
                ? 'No recipes found matching your criteria' 
                : 'No recipes to show'}
            </p>
            {(!searchTerm && selectedCategory === 'All') && (
              <div className="space-y-2">
                <p className="text-gray-400">Start by following some users or creating your first recipe!</p>
                <div className="space-x-4">
                  <Link
                    href="/recipe/create"
                    className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Create Recipe
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Story Viewer Modal */}
      {viewingStories && storiesData[viewingStories] && (
        <StoryViewer
          stories={storiesData[viewingStories]}
          onClose={() => setViewingStories(null)}
        />
      )}
    </div>
  )
}

export default HomePage
