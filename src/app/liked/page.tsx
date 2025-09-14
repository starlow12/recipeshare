'use client'

import React, { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import { RecipeCard } from '@/components/RecipeCard'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Search, Filter } from 'lucide-react'
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

const LikedRecipesPage = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchLikedRecipes()
    }
  }, [user])

  useEffect(() => {
    filterRecipes()
  }, [recipes, searchTerm, selectedCategory])

  const fetchLikedRecipes = async () => {
    if (!user) return

    try {
      setLoading(true)

      const { data: savedRecipesData, error } = await supabase
        .from('saved_recipes')
        .select(`
          created_at,
          recipes (
            *,
            profiles!recipes_created_by_fkey (
              username,
              avatar_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Extract recipes and add liked/saved status
      const recipesWithStatus = savedRecipesData?.map(item => ({
        ...item.recipes,
        is_saved: true,
        is_liked: false // We'll check this separately
      })) || []

      // Check which recipes are also liked by the user
      if (recipesWithStatus.length > 0) {
        const recipeIds = recipesWithStatus.map(r => r.id)
        
        const { data: likesData } = await supabase
          .from('likes')
          .select('recipe_id')
          .eq('user_id', user.id)
          .in('recipe_id', recipeIds)

        const likedRecipeIds = new Set(likesData?.map(l => l.recipe_id) || [])

        const recipesWithLikes = recipesWithStatus.map(recipe => ({
          ...recipe,
          is_liked: likedRecipeIds.has(recipe.id)
        }))

        setRecipes(recipesWithLikes)
      }

    } catch (error) {
      console.error('Error fetching liked recipes:', error)
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
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Saved Recipes
          </h1>
          <p className="text-gray-600">
            Your collection of favorite recipes
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search saved recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex justify-center">
            <div className="flex space-x-2 overflow-x-auto pb-2 max-w-full">
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

          {/* Results Count */}
          <div className="text-center text-gray-600">
            {filteredRecipes.length === recipes.length 
              ? `${recipes.length} saved recipe${recipes.length !== 1 ? 's' : ''}`
              : `${filteredRecipes.length} of ${recipes.length} recipes`
            }
          </div>
        </div>

        {/* Recipes Grid */}
        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : recipes.length === 0 ? (
          /* No saved recipes at all */
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔖</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No saved recipes yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start saving recipes you love to see them here
            </p>
            <a
              href="/"
              className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Discover Recipes
            </a>
          </div>
        ) : (
          /* No recipes match search/filter */
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No recipes found
            </h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <div className="space-x-4">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('All')
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LikedRecipesPage
