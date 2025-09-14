'use client'

import React, { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import { RecipeCard } from '@/components/RecipeCard'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Search } from 'lucide-react'
import Link from 'next/link'
import type { Recipe } from '@/lib/types'

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
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  
  const { user, profile } = useAuth()

  useEffect(() => {
    fetchData()
  }, [user])

  useEffect(() => {
    filterRecipes()
  }, [recipes, searchTerm, selectedCategory])

  const fetchData = async () => {
    try {
      // Fetch public recipes (all recipes if not logged in, or personalized if logged in)
      let query = supabase
        .from('recipes')
        .select(`
          *,
          profiles!recipes_created_by_fkey (
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })

      // If user is logged in, prioritize followed users + own recipes
      if (user) {
        const { data: followedUsers } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id)

        const followedUserIds = followedUsers?.map(f => f.following_id) || []
        const userIds = [...followedUserIds, user.id]
        
        if (userIds.length > 1) { // Only filter if user follows someone or has own recipes
          query = query.in('created_by', userIds)
        }
      }

      const { data: recipesData, error: recipesError } = await query.limit(20)

      if (recipesError) throw recipesError

      // Check which recipes are liked/saved by current user (if logged in)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to RecipeGram
          </h1>
          <p className="text-gray-600">
            Discover and share amazing recipes from around the world
          </p>
          {!user && (
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
          )}
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
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
          <div className="flex justify-center">
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
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {searchTerm || selectedCategory !== 'All' 
                ? 'No recipes found' 
                : 'No recipes yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedCategory !== 'All'
                ? 'Try adjusting your search or filter criteria'
                : 'Be the first to share a delicious recipe!'}
            </p>
            {user && (
              <Link
                href="/recipe/create"
                className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Create Your First Recipe
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage
